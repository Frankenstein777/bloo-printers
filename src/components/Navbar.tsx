import { getSession } from '@/lib/auth'
import NavbarClient from '@/components/NavbarClient'
import { getActiveDiscount } from '@/app/actions'

export default async function Navbar() {
    const [session, discount] = await Promise.all([
        getSession(),
        getActiveDiscount()
    ])
    return <NavbarClient session={session} discount={discount} />
}
