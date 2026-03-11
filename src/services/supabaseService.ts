import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}

export interface SupabaseUser {
  id: string;
  email: string;
  revenuecat_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseSubscription {
  id?: string;
  user_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'free';
  plan_type: 'free' | 'mensile' | 'annuale' | 'lifetime';
  current_period_end?: string;
  tutor_sessions_used_this_month: number;
  tutor_minutes_used_this_month: number;
  tutor_minutes_reset_at?: string;
  updated_at?: string;
}

// Límite de minutos mensuales por plan
export const TUTOR_MINUTE_LIMITS: Record<string, number> = {
  free: 0,
  mensile: 60,
  annuale: 90,
  lifetime: 999,
};

export class SupabaseService {
  static isConfigured(): boolean {
    return !!supabaseUrl && !!supabaseAnonKey;
  }

  /**
   * Crea o actualiza el registro del usuario en Supabase.
   * Se llama automáticamente tras sign in / sign up exitoso.
   */
  static async upsertUser(userId: string, email: string): Promise<void> {
    const client = getClient();
    if (!client) return;

    const { error } = await client
      .from('users')
      .upsert(
        { id: userId, email, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );

    if (error) console.error('[Supabase] upsertUser:', error.message);
  }

  /**
   * Obtiene el estado de suscripción del usuario desde Supabase.
   * Retorna null si el usuario es free (sin registro) o si Supabase no está configurado.
   */
  static async getSubscription(userId: string): Promise<SupabaseSubscription | null> {
    const client = getClient();
    if (!client) return null;

    const { data, error } = await client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116 = row not found — esperado para usuarios free sin suscripción
      if (error.code !== 'PGRST116') {
        console.error('[Supabase] getSubscription:', error.message);
      }
      return null;
    }

    return data;
  }

  /**
   * Crea registro de suscripción free si el usuario no tiene ninguno.
   * Se llama tras el primer sign up para garantizar coherencia en DB.
   */
  static async ensureFreeSubscription(userId: string): Promise<void> {
    const client = getClient();
    if (!client) return;

    const existing = await this.getSubscription(userId);
    if (existing) return;

    const { error } = await client.from('subscriptions').insert({
      user_id: userId,
      status: 'free',
      plan_type: 'free',
      tutor_sessions_used_this_month: 0,
    });

    // 23505 = unique constraint violated (ya existe) — ignorar
    if (error && error.code !== '23505') {
      console.error('[Supabase] ensureFreeSubscription:', error.message);
    }
  }

  /**
   * Obtiene los minutos de tutor usados este mes.
   * Resetea automáticamente si el reset_at es de un mes anterior.
   */
  static async getTutorMinutesUsed(userId: string): Promise<number> {
    const sub = await this.getSubscription(userId);
    if (!sub) return 0;

    // Verificar si hay que resetear (nuevo mes)
    const resetAt = sub.tutor_minutes_reset_at
      ? new Date(sub.tutor_minutes_reset_at)
      : new Date(0);
    const now = new Date();
    const isNewMonth =
      resetAt.getMonth() !== now.getMonth() ||
      resetAt.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
      await this.resetTutorMinutes(userId);
      return 0;
    }

    return sub.tutor_minutes_used_this_month ?? 0;
  }

  /**
   * Agrega minutos usados al contador mensual del usuario.
   */
  static async addTutorMinutes(userId: string, minutes: number): Promise<void> {
    const client = getClient();
    if (!client || minutes <= 0) return;

    const current = await this.getTutorMinutesUsed(userId);

    const { error } = await client
      .from('subscriptions')
      .update({
        tutor_minutes_used_this_month: current + minutes,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) console.error('[Supabase] addTutorMinutes:', error.message);
  }

  /**
   * Resetea el contador de minutos mensuales.
   */
  static async resetTutorMinutes(userId: string): Promise<void> {
    const client = getClient();
    if (!client) return;

    await client
      .from('subscriptions')
      .update({
        tutor_minutes_used_this_month: 0,
        tutor_minutes_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * Registra una sesión del tutor completada.
   */
  static async logTutorSession(
    userId: string,
    durationSeconds: number,
    errorsCorrecteds: number
  ): Promise<void> {
    const client = getClient();
    if (!client) return;

    await client.from('tutor_sessions').insert({
      user_id: userId,
      duration_seconds: durationSeconds,
      errors_corrected: errorsCorrecteds,
    });

    await client.rpc('increment_tutor_sessions', { p_user_id: userId });
  }
}
