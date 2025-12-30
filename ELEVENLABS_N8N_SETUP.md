# ElevenLabs Call Recording Integration with n8n

This guide explains how to set up an n8n workflow to receive ElevenLabs call recording webhooks and store them in Supabase.

## Prerequisites

- n8n instance (cloud or self-hosted)
- ElevenLabs account with conversational AI agent configured
- Supabase project with the call_recordings migration applied
- Supabase Service Role Key (from your Supabase project settings)

## Workflow Overview

The n8n workflow will:
1. Receive webhook from ElevenLabs when a call completes
2. Extract audio data (base64 encoded) and metadata
3. Decode the audio to binary format
4. Upload audio file to Supabase Storage
5. Insert call metadata into the `call_recordings` table
6. Optionally link to existing appointments/inquiries by phone number

## Step-by-Step Setup

### 1. Create New Workflow in n8n

1. Log into your n8n instance
2. Click "Create New Workflow"
3. Name it "ElevenLabs Call Recording Handler"

### 2. Add Webhook Trigger Node

**Node Type:** Webhook
**Configuration:**
- **HTTP Method:** POST
- **Path:** `elevenlabs-recording` (or your preferred path)
- **Authentication:** None (we'll use ElevenLabs signature verification)
- **Response Mode:** Immediately
- **Response Code:** 200

**Webhook URL will be:** `https://your-n8n-instance.com/webhook/elevenlabs-recording`

### 3. Add Code Node - Extract & Decode Audio

**Node Type:** Code
**Name:** "Extract Audio Data"

```javascript
// Extract data from ElevenLabs webhook
// Access the body object which contains the actual webhook data
const webhookData = $input.item.json.body || $input.item.json;

// Parse the webhook payload - audio is in 'full_audio' field
const conversationId = webhookData.data?.conversation_id;
const agentId = webhookData.data?.agent_id;
const userId = webhookData.data?.user_id;
const audioBase64 = webhookData.data?.full_audio;

// Check if we have audio data
if (!audioBase64) {
  throw new Error('No audio data found in webhook payload. Received: ' + JSON.stringify(webhookData, null, 2));
}

// Decode base64 audio to binary
const audioBuffer = Buffer.from(audioBase64, 'base64');

// Prepare output
return {
  json: {
    conversation_id: conversationId,
    agent_id: agentId,
    user_id: userId,
    call_id: conversationId, // Use conversation_id as call_id
    customer_phone: null, // Will need to be populated from your system
    customer_name: null, // Will need to be populated from your system
    duration_seconds: null, // Calculate from audio if needed
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
    transcript: null, // Not included in post_call_audio webhook
    transcript_summary: null, // Not included in post_call_audio webhook
  },
  binary: {
    audio: {
      data: audioBuffer.toString('base64'),
      mimeType: 'audio/mpeg',
      fileName: `call-${conversationId}.mp3`
    }
  }
};
```

### 4. Add HTTP Request Node - Upload to Supabase Storage

**Node Type:** HTTP Request
**Name:** "Upload Audio to Supabase"

**Configuration:**
- **Method:** POST
- **URL:** `{{ $env.SUPABASE_URL }}/storage/v1/object/call-recordings/{{ $env.USER_ID }}/{{ $json.call_id || $json.conversation_id }}.mp3`
- **Authentication:** Generic Credential Type
  - **Header Name:** `Authorization`
  - **Header Value:** `Bearer {{ $env.SUPABASE_SERVICE_KEY }}`
- **Send Body:** Yes
- **Body Content Type:** Raw/Custom
- **Content Type:** `audio/mpeg`
- **Body:** `={{ $binary.audio.data }}`
- **Options:**
  - **Response Format:** JSON

**Headers to add:**
- `apikey`: `{{ $env.SUPABASE_SERVICE_KEY }}`
- `Content-Type`: `audio/mpeg`

### 5. Add Code Node - Prepare Database Record

**Node Type:** Code
**Name:** "Prepare DB Record"

```javascript
const uploadResponse = $input.first().json;
const callData = $('Extract Audio Data').first().json;

// Construct the audio URL from Supabase Storage
const audioPath = `${process.env.USER_ID}/${callData.call_id || callData.conversation_id}.mp3`;
const audioUrl = `${process.env.SUPABASE_URL}/storage/v1/object/call-recordings/${audioPath}`;

return {
  json: {
    user_id: process.env.USER_ID,
    call_id: callData.call_id,
    elevenlabs_conversation_id: callData.conversation_id,
    elevenlabs_agent_id: callData.agent_id,
    customer_name: callData.customer_name,
    customer_phone: callData.customer_phone,
    call_duration_seconds: callData.duration_seconds,
    call_started_at: callData.started_at,
    call_ended_at: callData.ended_at,
    audio_url: audioPath, // Store relative path
    audio_format: 'mp3',
    transcript: callData.transcript,
    transcript_summary: callData.transcript_summary,
    call_metadata: {
      upload_response: uploadResponse
    }
  }
};
```

### 6. Add Supabase Node - Insert Call Recording

**Node Type:** Supabase
**Name:** "Insert Call Recording"

**Configuration:**
- **Operation:** Insert
- **Table:** `call_recordings`
- **Data to Send:** All Fields Below
- **Fields:**
  - Map all fields from the previous node using expressions like `{{ $json.user_id }}`

**Credentials:**
- **Host:** Your Supabase URL
- **Service Role Secret:** Your Supabase Service Role Key

### 7. (Optional) Add Supabase Node - Link to Appointment

**Node Type:** Supabase
**Name:** "Link to Appointment"

**Configuration:**
- **Operation:** Update
- **Table:** `appointments`
- **Update Key:** `customer_phone`
- **Update Value:** `={{ $json.customer_phone }}`
- **Fields to Update:**
  - `call_id`: `={{ $json.call_id }}`

This will link the recording to any existing appointment with matching phone number.

## Environment Variables Required

Set these in your n8n environment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
USER_ID=your-user-uuid-here
```

## Configure ElevenLabs Webhook

1. Go to your ElevenLabs dashboard
2. Navigate to your Conversational AI agent settings
3. Find the "Webhooks" section
4. Add a new webhook:
   - **URL:** Your n8n webhook URL
   - **Event Type:** `post_call_audio`
   - **Secret:** (optional, for signature verification)

## Testing the Workflow

1. **Test in n8n:**
   - Click "Execute Workflow" in n8n
   - Use the "Listen for Test Event" option
   - Make a test call through ElevenLabs
   - Verify the workflow executes successfully

2. **Verify in Supabase:**
   - Check the `call-recordings` bucket for the audio file
   - Check the `call_recordings` table for the metadata record
   - Verify the audio URL is accessible

3. **Test in Your App:**
   - Navigate to an appointment or inquiry
   - Verify the call recording appears
   - Test audio playback

## Troubleshooting

### Audio file not uploading
- Verify your Supabase Service Role Key is correct
- Check that the `call-recordings` bucket exists
- Verify storage policies allow service role to insert

### Database record not created
- Check that the migration was applied successfully
- Verify RLS policies allow service role access
- Check n8n error logs for details

### Recording not appearing in app
- Verify the `user_id` matches your authenticated user
- Check that the audio URL is being constructed correctly
- Verify signed URL generation is working

## Advanced: Signature Verification

To verify webhooks are from ElevenLabs, add a Code node after the webhook trigger:

```javascript
const crypto = require('crypto');

const signature = $input.item.headers['elevenlabs-signature'];
const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
const payload = JSON.stringify($input.item.json);

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}

return $input.item;
```

## Next Steps

- Configure transcript webhooks for detailed conversation data
- Add error notifications (email/Slack) for failed uploads
- Implement automatic appointment linking by phone number
- Set up retention policies for old recordings
