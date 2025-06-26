const express = require("express");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

app.use(cors({
    origin: "https://evelinarudin.github.io",
    methods: ["GET", "POST"]
}));

app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
    const { cartItems } = req.body;

    const line_items = cartItems.map(item => ({
        price_data: {
            currency: "sek",
            product_data: { name: item.name },
            unit_amount: item.price * 100
        },
        quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        success_url: "https://evelinarudin.github.io/blooberry-crochet/success.html",
        cancel_url: "https://evelinarudin.github.io/blooberry-crochet/cart.html",
    });

    res.json({ url: session.url });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server körs på port ${PORT}`));