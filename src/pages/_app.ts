import type { App } from 'vue';
import { clerkPlugin } from '@clerk/vue'

const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY
console.log(PUBLISHABLE_KEY)
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}


export default (app: App) => {
    app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY })
};