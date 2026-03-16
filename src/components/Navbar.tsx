import { getSession } from '@/lib/auth'
import NavbarClient from '@/components/NavbarClient'

export default async function Navbar() {
    const session = await getSession()
    return <NavbarClient session={session} />
}

