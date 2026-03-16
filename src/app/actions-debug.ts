'use server'

export async function checkEnvVarsAction() {
    const hasSecret = !!process.env.PAYSTACK_SECRET_KEY
    const secretPrefix = process.env.PAYSTACK_SECRET_KEY ? process.env.PAYSTACK_SECRET_KEY.substring(0, 8) : 'NONE'

    console.log("DEBUG: Checking Env Vars on Server")
    console.log("DEBUG: PAYSTACK_SECRET_KEY loaded?", hasSecret)
    console.log("DEBUG: Prefix:", secretPrefix)

    return {
        hasSecret,
        prefix: secretPrefix
    }
}
