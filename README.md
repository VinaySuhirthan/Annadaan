# Annadaan — Every Plate Counts

**Good food should reach people, not go to waste.**

Annadaan connects people and businesses with surplus food to NGOs and shelters that can distribute it. Volunteers help move donations from pickup to delivery.

**The idea is simple:** post surplus food, find an organisation nearby, coordinate a pickup, and record the delivery.

🌐 **Project:** https://annadaan.vinaysuhirthan.tech

---

## Why Annadaan?

Food is often left over after weddings, events, restaurants and community gatherings. At the same time, nearby people may need a meal. The challenge is getting the food to the right organisation in time.

Annadaan brings donors, NGOs and volunteers into one place so they can coordinate that process.

## How it works

1. **A donor posts food** — adds the food details, quantity, photo and pickup information.
2. **An NGO finds a donation** — checks the available listing and sends a request.
3. **The donor responds** — reviews and accepts or rejects the request.
4. **A volunteer helps with delivery** — coordinates collection and transport where the workflow is available.
5. **The delivery is recorded** — status and feedback help build an activity and impact history.

## Who uses it?

- **Donors:** restaurants, event organisers, wedding hosts and individuals with surplus food.
- **NGOs and shelters:** organisations looking for food donations for their communities.
- **Volunteers:** people who can help collect and deliver food.

## What the project includes

- Separate donor, NGO and volunteer areas.
- Food donation listings with photo uploads.
- Food discovery and filtering.
- NGO request and donor approval flow.
- Volunteer pickup and delivery workflow.
- Delivery feedback and impact statistics.
- Supabase-backed data and storage, with live updates where configured.

The exact features available depend on the current deployment and its Supabase configuration.

## Built with

- **HTML, CSS and JavaScript** — user interface and browser-side application logic.
- **Supabase** — PostgreSQL database, authentication, storage and Realtime services used by the application.
- **Browser APIs** — features such as location access where supported and permitted by the user.

## Run it locally

You need a modern browser and Python or Node.js.

1. Clone the repository:

   ```bash
   git clone <your-repository-url>
   cd Annadaan
   ```

2. Configure the Supabase project URL and public client key using the configuration expected by `supabase-client.js`.

3. Start a local web server from the project folder:

   ```bash
   python -m http.server 8000
   ```

4. Open `http://localhost:8000` in your browser.

If you use Node.js instead, you can run:

```bash
npx serve . -p 8000
```

**Security:** Never place a Supabase service-role key or database password in frontend code or commit secrets to the repository. Protect exposed tables and storage with appropriate Supabase policies.

## Project structure

```text
Annadaan/
├── donor/          # Donor pages
├── volunteer/      # NGO and volunteer pages
├── migrations/     # Database migration files
├── images/         # Project image assets
├── index.html      # Main entry page
├── script.js       # Application logic
├── data.js         # Data helpers
├── style.css       # Shared styles
└── supabase-client.js
```

Some filenames may differ as the project changes; check the repository for the latest structure.

## Current status

Annadaan is a hackathon prototype under active development. It demonstrates the food donation and coordination workflow, but it should not be treated as a fully audited production service.

- A photo upload or visual demo animation is **not** an AI food-safety inspection.
- Food must be checked and handled responsibly by the donor and receiving organisation.
- Demo or synthetic analytics must be labelled as sample data and must not be presented as verified impact.
- Authentication, database permissions, Realtime subscriptions and deployment settings must be configured and tested for the target environment.

## What's next

- Improve mobile usability across all three portals.
- Strengthen role-based database access and session handling.
- Make donation claiming safe under simultaneous requests.
- Improve live status updates and delivery coordination.
- Expand testing for workflows, data integrity and security.

---

**Annadaan — Every Plate Counts.**

A meal shared can make a difference.
