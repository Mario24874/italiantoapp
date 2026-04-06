// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-11-20.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Processing event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession;
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType;

      if (!userId || !planType) {
        console.error('Missing userId or planType in session metadata');
        break;
      }

      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const item = sub.items.data[0];
        const billingInterval = item?.plan?.interval === 'year' ? 'year' : 'month';

        const { error } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          status: 'active',
          plan_type: planType,
          billing_interval: billingInterval,
          price_id: item?.price?.id ?? null,
          amount: item?.price?.unit_amount ?? null,
          currency: item?.price?.currency ?? null,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (error) console.error('Supabase upsert error:', error.message);
        else console.log(`Activated ${planType} for user ${userId}`);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const newStatus = sub.status === 'active' ? 'active' :
                        sub.status === 'past_due' ? 'past_due' : 'canceled';

      const { error } = await supabase.from('subscriptions').update({
        status: newStatus,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);

      if (error) console.error('Subscription update error:', error.message);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const { error } = await supabase.from('subscriptions').update({
        status: 'canceled',
        plan_type: 'free',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);

      if (error) console.error('Subscription delete error:', error.message);
      else console.log(`Canceled subscription for user ${userId}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
