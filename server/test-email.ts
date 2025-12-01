import { Resend } from 'resend';

const resend = new Resend('re_5CLwMWEz_CkRzVN3ZYNfVfAijw7Zz7irW');

async function test() {
  try {
    const result = await resend.emails.send({
      from: 'GameSetMatch <onboarding@resend.dev>',
      to: 'sudhirmalini@gmail.com',
      subject: 'Test Email',
      html: '<p>This is a test email from GameSetMatch!</p>',
    });
    console.log('✅ Success:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();