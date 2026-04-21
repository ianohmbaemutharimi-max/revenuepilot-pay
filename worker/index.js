import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Process event
async function processEvent(event) {
  const { id, event_type, payload } = event

  try {
    console.log("Processing:", event_type)

    if (event_type === 'PAYMENT_SUCCESS') {
      
      // Example actions
      await sendNotification(payload)
      await triggerWebhook(payload)

    }

    // Mark as processed
    await supabase
      .from('event_bus')
      .update({
        status: 'PROCESSED',
        processed_at: new Date()
      })
      .eq('id', id)

  } catch (err) {
    console.error("Error:", err)

    // Mark failed
    await supabase
      .from('event_bus')
      .update({
        status: 'FAILED'
      })
      .eq('id', id)
  }
}
