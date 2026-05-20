# 🪄 Gamma AI Prompt & Outline for Standard 16:9 Slides (Xerox/Print Ready)

Copy the prompt and the Markdown content below into Gamma AI (gamma.app). It is optimized to produce slides of **exactly the same width and height (16:9 landscape)** without overflow, making them perfect for printing/photocopying.

---

## 🛠️ Step-by-Step: How to Make All Slides the Same Size in Gamma AI

By default, Gamma uses a **"Fluid"** card size that changes depending on how much text or image size is in a slide. To force all slides to have the exact same size:

1. **Change Layout to Presentation Mode:**
   * In the top-right corner of the Gamma editor, click the **three dots (...)** next to the "Present" button.
   * Click **Page Setup** (or **Card settings**).
   * Set the aspect ratio to **Presentation (16:9)** (instead of *Fluid* or *Document*).

2. **Set Card Height to Fixed (Crucial for Print/Xerox):**
   * In the same **Page Setup** side panel, look for **Card Height**.
   * Change it from **"Fit to Content"** (which makes them stretch) to **"Fixed Height"** (which forces all slides to be the exact same height).

3. **Shrink Tall Images/Grids:**
   * If Slide 4, 5, 8, or 10 still stretches because of images:
     * Click on the image in Gamma and use the corner drag-handles to **shrink the image** to be smaller.
     * Click the **AI Sparkle button** on that specific card and type: *"Make this card fit standard height"* or *"Change layout to a 2-column horizontal grid"*.

---

## 1. Instructions to Paste Into Gamma AI (Prompt box)
> "Generate a professional 10-slide presentation from the provided Markdown outline. Use a clean, modern corporate layout with a green-and-white AgTech color theme.
> 
> **CRITICAL CARD BOUNDARY RULES FOR PRINTING:**
> 1. Use standard **16:9 Landscape slide layout**.
> 2. Force all cards to have **identical width and height** (Fixed Card Height).
> 3. Limit text on each slide to 3 or 4 brief bullet points. **Do not create vertical stacks, nested cards, or tall lists** that force vertical scrolling.
> 4. Keep all images small and horizontal to prevent cards from stretching."

---

## 2. Optimized Markdown Outline (Shortened to Prevent Stretching)

```markdown
# Slide 1: PROJECT TITLE: UZHAVAN 2 DOORSTEP
## Subtitle: Connecting Farmers Directly to Retailers & Consumers
* **Project Team Details:**
  * **Member 1:** [Name] | Reg No: [Register Number] | Dept: [Department]
  * **Member 2:** [Name] | Reg No: [Register Number] | Dept: [Department]
  * **Member 3:** [Name] | Reg No: [Register Number] | Dept: [Department]
  * **Member 4:** [Name] | Reg No: [Register Number] | Dept: [Department]
* **Platform Pillars:** Next-Gen AgTech, Direct P2P Commerce, Live Price Ticker.

---

# Slide 2: The Supply Chain Crisis
## Challenges in Traditional Agriculture
* **Middlemen Exploitation:** Farmers receive only 20-30% of market value.
* **Price Asymmetry:** Lack of live, verified market rate updates.
* **No Traceability:** Consumers cannot verify harvest dates or source locations.

---

# Slide 3: The Technology Solution
## Key Features of Uzhavan 2 Doorstep
* **P2P Marketplace:** Direct shop-to-farm orders boosting margins.
* **Dynamic QR Codes:** Quick-scan crop traceability labels on shipping boxes.
* **Agmarknet Ticker:** Automatic daily sync with government rates.

---

# Slide 4: Key Platform Features & AI Tools
## Core Capabilities & Interactive UX Design
* **AI Crop Disease Scanner (Beta):** Simulated leaf scan diagnostics with organic remedies in Tamil & English.
* **Live Route Map Tracking:** Dynamic coordinate overlay routing farmer location to retailer location.
* **Modern Design:** Glassmorphic layout with drag-and-drop crop uploader.

---

# Slide 5: Technical Architecture
## DECOUPLED FULL-STACK INFRASTRUCTURE
* **Frontend:** React.js, Redux Toolkit, Tailwind CSS (Glassmorphism).
* **Backend:** Node.js, Express.js REST API endpoints.
* **Database:** PostgreSQL server managed via Sequelize ORM.
* **Cloud:** Cloudinary (Images) and Brevo (SMTP client).

---

# Slide 6: The User Journey
## A Seamless 4-Step Operational Flow
* **Step 1: Listing:** Farmers upload crop details, images, and weight.
* **Step 2: Pricing:** System suggests list prices based on daily rates.
* **Step 3: Purchase:** Retailers order directly and receive PDF invoices.
* **Step 4: Trace:** Buyers scan box QR code to verify crop origin.

---

# Slide 7: Technical Breakthroughs
## Overcoming Engineering Challenges
* **API Payload Limit:** Solved 10-record default limit by scaling to `limit=1000`.
* **Scroll Restoration:** Solved React Router page-scroll retention glitches.
* **PostgreSQL Connection Pool:** Structured Sequelize pool sizes for high concurrency.

---

# Slide 8: Ecosystem Impact
## Value Proposition & Market Fit
* **For Farmers:** Direct wholesale access, no broker commission loss.
* **For Retailers:** Guaranteed farm-fresh quality, verifiable source.
* **For Society:** Local rural support, reduced carbon footprint.

---

# Slide 9: Futuristic Roadmap
## The Road Ahead
* **AI Price Forecasting:** ML prediction models to suggest next week's crop price.
* **IoT Cold-Chain:** Real-time temperature sensor integration for shipping logistics.
* **AI Diagnostic Scaling:** Extending leaf diagnostics to detect 50+ regional crop varieties.

---

# Slide 10: Conclusion
## Thank You / Q&A
* **Live Web App:** https://uzhavan2doorstep-cb.vercel.app
* **Backend API:** https://uzhavan-backend-zyp7.onrender.com
* **Project Goal:** Making agriculture fair, transparent, and sustainable.
```
