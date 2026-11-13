package com.swati.evtimebackend.config;

import com.swati.evtimebackend.entity.News;
import com.swati.evtimebackend.repository.NewsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Inserts evergreen sample articles on an empty database so that the site
 * is not blank on first run. Enabled with SEED_DEMO_DATA=true.
 */
@Component
@Order(2)
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String IMG = "https://images.unsplash.com/photo-";

    private final NewsRepository newsRepository;
    private final boolean enabled;

    public DemoDataSeeder(
            NewsRepository newsRepository,
            @Value("${app.seed.enabled:false}") boolean enabled) {
        this.newsRepository = newsRepository;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled || newsRepository.count() > 0) {
            return;
        }

        List<News> items = new ArrayList<>();
        Instant now = Instant.now();
        int hoursAgo = 2;

        record Seed(String title, String description, String category, String image,
                    boolean featured, long views, String content) {
        }

        List<Seed> seeds = List.of(
                new Seed(
                        "Solid-state batteries: what they promise and what still stands in the way",
                        "Higher energy density and faster charging make solid-state cells the most watched idea in EV engineering. Here is where the technology stands.",
                        "Batteries", "1620714223084-8fcacc6dfd8d?w=1400&q=80", true, 940,
                        "Solid-state batteries replace the liquid electrolyte in today's lithium-ion cells with a solid material. In theory this allows more energy to be packed into the same space, which can mean longer range or a lighter pack.\n\nThe same design may also tolerate faster charging and reduce the risk of leaks and thermal runaway. Those are the reasons nearly every major manufacturer and many start-ups run research programmes on the technology.\n\nThe obstacles are practical rather than theoretical. Solid electrolytes must stay in close contact with the electrodes through thousands of charge cycles, and manufacturing them at scale and at a competitive cost is still unproven.\n\nFor buyers, the realistic expectation is gradual progress: improved lithium-ion chemistries will keep arriving while solid-state designs move from pilot lines to limited production."),
                new Seed(
                        "A beginner's guide to charging an EV at home",
                        "From a simple wall socket to a dedicated wallbox, this is what to know before you plug in for the first time.",
                        "Infrastructure", "1593941707882-a5bba14938c7?w=1400&q=80", true, 870,
                        "Most EV owners do the bulk of their charging at home, overnight. The cheapest option is a standard household socket, but it delivers very little power and can take a full day to add meaningful range.\n\nA dedicated wallbox is installed by a qualified electrician and delivers several times more power. It also includes safety features designed for the long, continuous load of charging a car.\n\nBefore installing one, check the capacity of your electrical supply, the distance from the panel to the parking spot, and whether your utility offers cheaper night-time tariffs.\n\nFinally, remember that you rarely need to charge to 100 percent. Many drivers set a daily limit of around 80 percent and charge fully only for long trips."),
                new Seed(
                        "How public fast-charging networks are being built out",
                        "Highway corridors, shopping centres and workplaces are all getting fast chargers. We look at how the networks are planned.",
                        "Infrastructure", "1617788138017-80ad40651399?w=1400&q=80", false, 610,
                        "Fast-charging networks are usually built in stages. Operators first cover major highway corridors so long trips become possible, then add chargers in cities where many drivers cannot charge at home.\n\nSite selection depends on grid capacity as much as on traffic. A station with many high-power chargers needs a strong connection, and waiting for the grid upgrade is often the slowest part of a project.\n\nReliability matters as much as the number of plugs. Drivers consistently rank chargers that work first time, with simple payment, above chargers that are merely fast.\n\nExpect more sites to add batteries, solar canopies and amenities such as cafes, so that a charging stop feels like an ordinary break."),
                new Seed(
                        "Understanding EV incentives: how purchase subsidies and tax rules work",
                        "Incentive schemes differ widely between countries and change often. A short guide to the common types and how to check what applies to you.",
                        "Policy", "1581092160562-40aa08e78837?w=1400&q=80", false, 455,
                        "Governments use several tools to encourage electric vehicle adoption: direct purchase subsidies, tax credits, reduced registration fees and lower road taxes.\n\nSome schemes limit support to vehicles under a certain price or made locally, and many are reduced over time as the market grows. That makes the date of purchase important.\n\nBusinesses and fleet operators often have separate rules, including depreciation benefits for vehicles and charging equipment.\n\nBecause rules change, always confirm current terms with the official government or tax authority website before deciding, and ask the dealer which incentives are already included in the quoted price."),
                new Seed(
                        "Why battery recycling could reshape the EV supply chain",
                        "As the first generation of EVs ages, recovering lithium, nickel and cobalt could ease pressure on mining.",
                        "Batteries", "1473341304170-971dccb5ac1e?w=1400&q=80", true, 780,
                        "Batteries contain valuable materials, and as large numbers of EVs reach the end of their first life the volume available for recycling will grow quickly.\n\nBefore recycling, many packs can be reused in stationary storage, where lower performance is acceptable. Only afterwards are they shredded and processed to recover metals.\n\nModern recycling processes aim to recover most of the key metals at high purity so they can go straight back into new cells. Success depends on collection systems, transport rules and pack designs that are easy to take apart.\n\nPolicy-makers in several regions are introducing recycled-content and collection targets to build the sector."),
                new Seed(
                        "Road test: what to look for when you take an EV for a test drive",
                        "Range figures are only part of the story. A checklist for your first test drive of an electric car.",
                        "Reviews", "1560958089-b8a1929cea89?w=1400&q=80", false, 390,
                        "Start with the basics: seating position, visibility and how the car feels at low speed. Electric cars are quiet, so wind and road noise stand out more.\n\nTry the regenerative braking settings. Many cars offer a strong one-pedal mode and a gentler mode, and which one feels natural is personal.\n\nCheck the infotainment system, particularly the route planner and the way it suggests charging stops, since you will use it often.\n\nAsk about the charging speed curve rather than only the peak figure, and confirm the charging port type matches the chargers common in your area."),
                new Seed(
                        "The rise of electric two-wheelers in dense cities",
                        "Scooters and motorcycles are often the first electric vehicle many households buy. Why they are growing so quickly.",
                        "Market", "1558494949-ef010cbdcc31?w=1400&q=80", false, 520,
                        "Electric two-wheelers have lower purchase and running costs than cars, need smaller batteries, and can often be charged from a normal socket.\n\nIn crowded cities, where daily trips are short, a small battery is more than enough. Swappable battery systems go further by letting riders exchange an empty pack for a charged one in minutes.\n\nDelivery fleets are a major driver: predictable routes and high daily distances make the savings on fuel and maintenance easy to calculate.\n\nChallenges include fire safety for poorly made packs, so buyers should choose certified products and chargers."),
                new Seed(
                        "How vehicle-to-grid technology could turn parked cars into power plants",
                        "Bidirectional charging lets an EV send energy back to a home or the grid. The idea is simple, the details are not.",
                        "Technology", "1518770660439-4636190af475?w=1400&q=80", true, 660,
                        "Vehicle-to-grid, or V2G, uses a bidirectional charger so that an EV can both draw power and supply it. Cars sit parked for most of the day, which makes their batteries a large, distributed store of energy.\n\nUtilities can use that flexibility to smooth demand peaks, and owners can be paid for it. A related option, vehicle-to-home, simply uses the car as backup power during an outage.\n\nTo work well, the system needs compatible cars and chargers, clear technical standards and tariffs that reward owners fairly for the wear on the battery.\n\nPilot projects in several countries are testing these questions with real households."),
                new Seed(
                        "What drives the total cost of owning an electric car",
                        "The sticker price is only one number. Energy, maintenance, insurance and resale value all shape the real cost.",
                        "Market", "1511919884226-fd3cad34687c?w=1400&q=80", false, 340,
                        "Electric cars often cost more to buy but less to run. Electricity per kilometre is usually cheaper than fuel, particularly when charging at home on an off-peak tariff.\n\nMaintenance is simpler because there is no engine oil, fewer moving parts and less brake wear thanks to regenerative braking.\n\nInsurance, tyres and depreciation can offset part of the saving, and resale values depend on battery health and how quickly technology changes.\n\nThe best approach is to compare models over the period you expect to own the car, using your own mileage and local energy prices."),
                new Seed(
                        "Grid readiness: can power networks handle millions of EVs?",
                        "Analysts say the challenge is less about total energy and more about when and where cars charge.",
                        "Policy", "1532601224476-15c79f2f7a51?w=1400&q=80", false, 300,
                        "The extra electricity needed for transport is significant but spread over many years, which gives utilities time to plan. The harder problem is local: a street where every house adds a charger can strain its transformer.\n\nSmart charging helps by shifting demand to periods when the grid has spare capacity, for example overnight or when renewable output is high.\n\nTime-of-use tariffs and managed charging programmes make that shift easy for drivers.\n\nRegulators are therefore focused on upgrading local networks, setting charger standards and ensuring that new connections can be approved quickly."),
                new Seed(
                        "Lithium-ion chemistries compared: NMC versus LFP",
                        "Two battery chemistries dominate today's EVs. Each has strengths that suit different drivers.",
                        "Batteries", "1581091226825-a6a2a5aee158?w=1400&q=80", false, 410,
                        "Nickel-manganese-cobalt (NMC) cells offer higher energy density, so they are common in long-range and performance models.\n\nLithium-iron-phosphate (LFP) cells store less energy for their weight, but they avoid cobalt and nickel, usually cost less and tolerate frequent full charging well.\n\nFor drivers who mostly commute, an LFP pack is often more than adequate and can last for a very large number of cycles.\n\nManufacturers increasingly offer both, choosing the chemistry that fits each model and price point."),
                new Seed(
                        "Driver-assistance systems: what the levels of automation really mean",
                        "Marketing names can be confusing. The standard levels of driving automation explain what a system can and cannot do.",
                        "Technology", "1492144534655-ae79c964c9d7?w=1400&q=80", false, 280,
                        "Industry standards describe driving automation from level 0, where the human does everything, to level 5, where the vehicle drives itself in all conditions.\n\nMost cars sold today are at level 2: the system can steer and control speed together, but the driver must watch the road and be ready to take over at any moment.\n\nHigher levels require the system itself to handle the driving task in defined conditions, which brings questions of liability and regulation.\n\nWhatever a brand calls its feature, read the owner's manual to understand its limits and keep your attention on the road."));

        for (Seed s : seeds) {
            News n = new News();
            n.setTitle(s.title());
            n.setDescription(s.description());
            n.setContent(s.content());
            n.setCategory(s.category());
            n.setImageUrl(IMG + s.image());
            n.setAuthor("EV Times Desk");
            n.setFeatured(s.featured());
            n.setViews(s.views());
            n.setCreatedAt(now.minus(hoursAgo, ChronoUnit.HOURS));
            items.add(n);
            hoursAgo += 7;
        }

        newsRepository.saveAll(items);
        log.info("Seeded {} demo articles", items.size());
    }
}
