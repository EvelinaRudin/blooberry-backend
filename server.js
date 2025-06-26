/**
 * Corrected server.js for Node.js + Express backend to handle Stripe Checkout sessions securely.
 * - Uses STRIPE_SECRET_KEY from environment (no hardcoded secret keys) for security.
 * - Enables CORS only for the specific GitHub Pages origin (avoids wildcard '*' for safety):contentReference[oaicite:0]{index=0}.
 * - Accepts POST requests to "/create-checkout-session" with a JSON body containing `cartItems`.
 * - Builds Stripe Checkout `line_items` using price_data to specify product details inline:contentReference[oaicite:1]{index=1}.
 * - Returns the Stripe Checkout Session URL as a JSON response, for the frontend to redirect the user:contentReference[oaicite:2]{index=2}.
 * - Includes basic error handling and proper HTTP status codes for robustness.
 * (Removed duplicate CORS configuration lines from original file to fix syntax errors:contentReference[oaicite:3]{index=3})
 */

const express = require("express");
const cors = require("cors");
const app = express();

// Load Stripe with secret key from environment variable for security
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.error("Error: STRIPE_SECRET_KEY environment variable is not set.");
    process.exit(1);
}
const stripe = require("stripe")(stripeSecretKey);

// Enable CORS for the trusted frontend origin only (GitHub Pages site):contentReference[oaicite:4]{index=4}
app.use(cors({
    origin: "https://evelinarudin.github.io",
    methods: ["GET", "POST"],
    optionsSuccessStatus: 200  // some legacy browsers (IE11) choke on 204
}));

// Parse JSON request bodies
app.use(express.json());

// Endpoint to create a Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
    try {
        const { cartItems } = req.body;
        if (!cartItems || !Array.isArray(cartItems)) {
            return res.status(400).json({ error: "Invalid cartItems data" });
        }

        // Convert cart items to Stripe Checkout line_items format with price_data:contentReference[oaicite:5]{index=5}
        const line_items = cartItems.map(item => {
            if (!item.name || !item.price || !item.quantity) {
                throw new Error("Invalid cart item format");
            }
            return {
                price_data: {
                    currency: "sek",
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100)  // smallest currency unit (e.g. 100 öre = 1 SEK):contentReference[oaicite:6]{index=6}
                },
                quantity: item.quantity
            };
        });

        // Create a Checkout Session with specified line items and redirect URLs
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: line_items,
            success_url: "https://evelinarudin.github.io/blooberry-crochet/success.html",
            cancel_url: "https://evelinarudin.github.io/blooberry-crochet/cart.html"
        });

        // Send the session URL back to the client for redirecting to Stripe Checkout:contentReference[oaicite:7]{index=7}
        return res.json({ url: session.url });
    } catch (err) {
        console.error("Error creating checkout session:", err.message);
        return res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// Start the server on the port provided by Render or default to 10000 for local testing
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
