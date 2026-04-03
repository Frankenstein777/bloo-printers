import { redirect } from 'next/navigation'

// Redirect old /browse links to the new /catalog route
export default function BrowseRedirectPage() {
    redirect('/catalog')
}
