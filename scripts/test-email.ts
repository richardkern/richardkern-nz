import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const result = await payload.sendEmail({
  to: 'richard.kern@gmail.com',
  subject: 'Payload adapter test',
  text: 'Sent through payload.sendEmail() via the Resend adapter.',
})
console.log('sendEmail result:', JSON.stringify(result))
process.exit(0)
