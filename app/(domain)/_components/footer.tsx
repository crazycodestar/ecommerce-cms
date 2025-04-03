import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-8 px-4 bg-gray-50">
      <div className="mx-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 className="font-medium mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact-us">Contact Us</Link>
              </li>
              <li>
                <Link href="/order-status">Order Status</Link>
              </li>
              <li>
                <Link href="/shipping">Shipping</Link>
              </li>
              <li>
                <Link href="/returns">Returns</Link>
              </li>
              <li>
                <Link href="/gift-cards">Gift Cards</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">About Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/careers">Careers</Link>
              </li>
              <li>
                <Link href="/corporate-social">
                  Corporate Social Responsibility
                </Link>
              </li>
              <li>
                <Link href="/diversity">Diversity & Inclusion</Link>
              </li>
              <li>
                <Link href="/press-releases">Press Releases</Link>
              </li>
              <li>
                <Link href="/investors">Investors</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Purpleventures Card</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/apply">Apply for a Card</Link>
              </li>
              <li>
                <Link href="/pay-bill">Pay My Bill</Link>
              </li>
              <li>
                <Link href="/manage-account">Manage My Account</Link>
              </li>
              <li>
                <Link href="/card-benefits">Card Benefits</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Purpleventures, Inc.</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/Purpleventures">Purpleventures</Link>
              </li>
              <li>
                <Link href="/Purpleventures-rack">Purpleventures Rack</Link>
              </li>
              <li>
                <Link href="/Purpleventures-canada">Purpleventures Canada</Link>
              </li>
              <li>
                <Link href="/trunk-club">Trunk Club</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Store Locator</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/stores">Find a Store</Link>
              </li>
              <li>
                <Link href="/free-style-help">Free Style Help</Link>
              </li>
              <li>
                <Link href="/store-events">Store Events</Link>
              </li>
              <li>
                <Link href="/restaurants">Restaurants</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t">
          <div className="flex gap-4 mb-4 md:mb-0">
            <Link href="/privacy" className="text-xs">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs">
              Terms
            </Link>
            <Link href="/accessibility" className="text-xs">
              Accessibility
            </Link>
            <Link href="/do-not-sell" className="text-xs">
              Do Not Sell My Info
            </Link>
          </div>
          <div className="flex gap-4">
            <Link href="https://facebook.com" aria-label="Facebook">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                FB
              </div>
            </Link>
            <Link href="https://twitter.com" aria-label="Twitter">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                TW
              </div>
            </Link>
            <Link href="https://instagram.com" aria-label="Instagram">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                IG
              </div>
            </Link>
            <Link href="https://pinterest.com" aria-label="Pinterest">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                PT
              </div>
            </Link>
          </div>
        </div>

        <p className="text-xs text-center mt-8">© 2025 Purpleventures, Inc.</p>
      </div>
    </footer>
  );
}
