import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-[#e6e7db] py-12 px-4 text-[#222]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* SUPPORT */}
          <div>
            <h3 className="uppercase tracking-widest text-xs font-normal mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/">Faq</Link>
              </li>
              <li>
                <Link to="/">Track Your Order</Link>
              </li>
              <li>
                <Link to="/">Bulk Orders</Link>
              </li>
              <li>
                <Link to="/">Ambassador Program</Link>
              </li>
            </ul>
          </div>
          {/* LEARN */}
          <div>
            <h3 className="uppercase tracking-widest text-xs font-normal mb-4">
              Learn
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/">About Us</Link>
              </li>
              <li>
                <Link to="/">Payment Provider</Link>
              </li>
            </ul>
          </div>
          {/* INFORMATION */}
          <div>
            <h3 className="uppercase tracking-widest text-xs font-normal mb-4">
              Information
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/">Terms Of Service</Link>
              </li>
              <li>
                <Link to="/">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/">Refund and Return Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter & Socials */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-8">
          <div className="flex-1 max-w-xl">
            <p className="text-sm mb-2">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>
            <div className="flex items-center border-b border-border max-w-xs">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent outline-none py-2 px-0 flex-1 text-sm"
              />
              <button className="p-2" aria-label="Subscribe">
                {/* Envelope icon (SVG) */}
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.091 7.091a2.25 2.25 0 01-3.182 0L2.909 8.584A2.25 2.25 0 012.25 6.993V6.75"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="https://instagram.com" aria-label="Instagram">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect
                  width="32"
                  height="32"
                  rx="8"
                  fill="currentColor"
                  className="text-foreground"
                />
                <path
                  d="M21.333 10.667a2.667 2.667 0 0 1 2.667 2.666v6.334a2.667 2.667 0 0 1-2.667 2.666h-6.666a2.667 2.667 0 0 1-2.667-2.666v-6.334a2.667 2.667 0 0 1 2.667-2.666h6.666Zm-3.333 2.666a2.667 2.667 0 1 0 0 5.334 2.667 2.667 0 0 0 0-5.334Zm4 0a.667.667 0 1 0 0 1.334.667.667 0 0 0 0-1.334Zm-4 1.334a1.333 1.333 0 1 1 0 2.666 1.333 1.333 0 0 1 0-2.666Z"
                  fill="currentColor"
                  className="text-background"
                />
              </svg>
            </a>
            <a href="https://facebook.com" aria-label="Facebook">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect
                  width="32"
                  height="32"
                  rx="8"
                  fill="currentColor"
                  className="text-foreground"
                />
                <path
                  d="M18.667 16h-1.334v6h-2.666v-6h-1.334v-2h1.334v-1.333c0-1.104.896-2 2-2h1.333v2h-1.333v1.333h1.333v2Z"
                  fill="currentColor"
                  className="text-background"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex justify-center gap-4 mb-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
            alt="Mastercard"
            className="h-6"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
            alt="Visa"
            className="h-6"
          />
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground">
          <div className="mb-1">© 2025 MUSICBOX LTD</div>
          <div>Powered by Shopify</div>
        </div>
      </div>
    </footer>
  );
}
