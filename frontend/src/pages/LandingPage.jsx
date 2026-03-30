import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, updatePlan } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const shouldOpenCaseStudies = params.get('openCaseStudies') === 'true';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [showCaseStudySelector, setShowCaseStudySelector] = useState(shouldOpenCaseStudies);
  const [showGallerySelector, setShowGallerySelector] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  // Detect screen size for responsive carousel
  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth < 768) {
        setItemsPerSlide(1); // Mobile: show 1 card
      } else {
        setItemsPerSlide(3); // Desktop/Tablet: show 3 cards
      }
    };

    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, []);

  const handlePlanSelection = async (planId, planName, planPrice) => {
    if (!isAuthenticated()) {
      navigate('/signup');
      return;
    }

    const result = await updatePlan(planId);
    if (result.success) {
      setSelectedPlan({ name: planName, price: planPrice });
      setShowSuccessModal(true);
    }
  };

  // Clean up URL after opening the case-study selector from the query flag.
  useEffect(() => {
    if (shouldOpenCaseStudies) {
      window.history.replaceState({}, '', '/');
    }
  }, [shouldOpenCaseStudies]);

  const successStories = [
    {
      title: "Coastal Ecosystem Restoration",
      description: "Working with local communities to restore mangrove ecosystems. Our AI analysis helped identify critical biodiversity hotspots.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      tag: "Water Quality",
      impact: "12,000 hectares protected",
      fullDescription: "In partnership with the Indonesian Ministry of Environment, GreenGPT analyzed over 200 coastal assessment reports to identify critical mangrove restoration zones. Our AI identified key biodiversity hotspots and vulnerable areas threatened by erosion and rising sea levels. The analysis revealed optimal planting locations and species selection strategies, leading to the successful restoration of 12,000 hectares of mangrove forests across 15 coastal communities.",
      metrics: [
        { label: "Reports Analyzed", value: "200+" },
        { label: "Communities Impacted", value: "15" },
        { label: "Carbon Sequestered", value: "45,000 tons/year" },
        { label: "Local Jobs Created", value: "350" }
      ],
      client: "Indonesian Ministry of Environment",
      duration: "18 months",
      location: "Java & Sumatra, Indonesia"
    },
    {
      title: "Urban Air Quality Monitoring",
      description: "City government used GreenGPT to process 500+ air quality reports, identifying major pollution sources.",
      image: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&h=600&fit=crop",
      tag: "Air Pollution",
      impact: "35% reduction in emissions",
      fullDescription: "The Delhi Municipal Corporation deployed GreenGPT to process 3 years of air quality monitoring data across 85 stations. Our AI identified industrial zones, traffic patterns, and seasonal factors contributing to poor air quality. The comprehensive analysis enabled targeted interventions including traffic management, industrial emission controls, and green belt expansion, resulting in a 35% reduction in PM2.5 levels over 24 months.",
      metrics: [
        { label: "Data Points Analyzed", value: "2.8M+" },
        { label: "Monitoring Stations", value: "85" },
        { label: "PM2.5 Reduction", value: "35%" },
        { label: "Hospital Visits Reduced", value: "22%" }
      ],
      client: "Delhi Municipal Corporation",
      duration: "24 months",
      location: "Delhi, India"
    },
    {
      title: "Climate Adaptation Planning",
      description: "NGO analyzed regional climate reports to develop community-based adaptation strategies for vulnerable populations.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop",
      tag: "Climate Action",
      impact: "50,000 lives protected",
      fullDescription: "Climate Resilience Foundation used GreenGPT to analyze IPCC reports, regional climate models, and local vulnerability assessments for sub-Saharan Africa. The AI identified high-risk communities vulnerable to droughts, floods, and food insecurity. This data-driven approach enabled the development of early warning systems, drought-resistant agriculture programs, and community evacuation protocols that now protect over 50,000 people across 8 countries.",
      metrics: [
        { label: "Countries Covered", value: "8" },
        { label: "Early Warning Systems", value: "45" },
        { label: "People Protected", value: "50,000+" },
        { label: "Climate Models Analyzed", value: "30+" }
      ],
      client: "Climate Resilience Foundation",
      duration: "36 months",
      location: "Sub-Saharan Africa"
    },
    {
      title: "Industrial Waste Management",
      description: "Manufacturing sector analyzed waste reports to implement circular economy principles and sustainability metrics.",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop",
      tag: "Waste Reduction",
      impact: "60% waste diverted",
      fullDescription: "A consortium of 45 manufacturing companies in Germany partnered with GreenGPT to analyze waste streams and implement circular economy strategies. Our AI processed waste audit reports, identified recycling opportunities, and optimized material flows. The analysis uncovered $12M in annual savings through waste reduction and material recovery, while diverting 60% of industrial waste from landfills.",
      metrics: [
        { label: "Waste Diverted", value: "60%" },
        { label: "Annual Savings", value: "$12M" },
        { label: "Companies Involved", value: "45" },
        { label: "Materials Recovered", value: "85,000 tons" }
      ],
      client: "German Industrial Consortium",
      duration: "12 months",
      location: "Bavaria, Germany"
    },
    {
      title: "Forest Conservation Initiative",
      description: "Environmental agency analyzed deforestation reports, creating targeted protection zones and reforestation strategies.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      tag: "Biodiversity",
      impact: "8,500 acres reforested",
      fullDescription: "The Brazilian Environmental Protection Agency used GreenGPT to analyze satellite imagery reports, indigenous land surveys, and deforestation patterns in the Amazon rainforest. Our AI identified critical corridors for wildlife, high-risk deforestation zones, and optimal reforestation areas. The insights led to the creation of 3 new protected areas and successful reforestation of 8,500 acres with native species, protecting endangered species habitats.",
      metrics: [
        { label: "Protected Areas Created", value: "3" },
        { label: "Acres Reforested", value: "8,500" },
        { label: "Native Species Planted", value: "120+" },
        { label: "Wildlife Corridors", value: "12" }
      ],
      client: "Brazilian EPA",
      duration: "30 months",
      location: "Amazon, Brazil"
    },
    {
      title: "Marine Pollution Control",
      description: "Coastal authority processed marine pollution data to identify sources and implement cleanup operations.",
      image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop",
      tag: "Ocean Health",
      impact: "200km coastline cleaned",
      fullDescription: "The Mediterranean Coastal Authority deployed GreenGPT to analyze marine pollution reports, ocean current data, and waste tracking studies. Our AI identified major sources of plastic pollution, tracked debris accumulation zones, and optimized cleanup operations. The targeted approach led to the removal of 450 tons of marine debris, cleanup of 200km of coastline, and implementation of upstream waste prevention measures affecting 25 coastal municipalities.",
      metrics: [
        { label: "Coastline Cleaned", value: "200km" },
        { label: "Debris Removed", value: "450 tons" },
        { label: "Municipalities Involved", value: "25" },
        { label: "Marine Species Protected", value: "80+" }
      ],
      client: "Mediterranean Coastal Authority",
      duration: "20 months",
      location: "Mediterranean Coast"
    },
    {
      title: "Renewable Energy Transition",
      description: "Energy ministry analyzed grid data and renewable capacity reports to accelerate clean energy adoption.",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
      tag: "Clean Energy",
      impact: "2GW renewable capacity added",
      fullDescription: "The Danish Energy Agency used GreenGPT to analyze national grid data, energy consumption patterns, and renewable energy feasibility studies. Our AI identified optimal locations for wind farms, solar installations, and energy storage facilities. The comprehensive analysis enabled strategic infrastructure investments that added 2GW of renewable capacity, reduced fossil fuel dependency by 40%, and created 1,200 green jobs in rural communities.",
      metrics: [
        { label: "Renewable Capacity", value: "2GW" },
        { label: "Fossil Fuel Reduction", value: "40%" },
        { label: "Green Jobs Created", value: "1,200" },
        { label: "Annual CO2 Savings", value: "3.2M tons" }
      ],
      client: "Danish Energy Agency",
      duration: "28 months",
      location: "Denmark"
    },
    {
      title: "Agricultural Sustainability",
      description: "Agricultural cooperative analyzed soil health reports to implement regenerative farming practices.",
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
      tag: "Sustainable Agriculture",
      impact: "15,000 farms transformed",
      fullDescription: "The Indian Agricultural Cooperative Network partnered with GreenGPT to analyze soil health data, crop yield reports, and water usage patterns across 15,000 small farms. Our AI identified opportunities for regenerative practices including crop rotation, organic fertilizers, and precision irrigation. The data-driven recommendations increased crop yields by 28%, reduced water consumption by 35%, and improved soil carbon sequestration, benefiting 75,000 farming families.",
      metrics: [
        { label: "Farms Transformed", value: "15,000" },
        { label: "Yield Increase", value: "28%" },
        { label: "Water Saved", value: "35%" },
        { label: "Families Benefited", value: "75,000" }
      ],
      client: "Indian Agricultural Cooperative",
      duration: "24 months",
      location: "Punjab & Haryana, India"
    },
    {
      title: "Wildlife Conservation Corridor",
      description: "Conservation organization analyzed habitat fragmentation data to create protected wildlife corridors.",
      image: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800&h=600&fit=crop",
      tag: "Wildlife Protection",
      impact: "5 species saved from extinction",
      fullDescription: "The East African Wildlife Foundation used GreenGPT to analyze satellite imagery, animal migration patterns, and land use data across Kenya and Tanzania. Our AI identified critical habitat corridors that connect fragmented ecosystems, enabling safe wildlife migration. The analysis led to the establishment of 8 protected corridors covering 2,500km², reducing human-wildlife conflict by 65% and helping 5 endangered species recover, including the African elephant and black rhino.",
      metrics: [
        { label: "Protected Corridors", value: "8" },
        { label: "Area Covered", value: "2,500km²" },
        { label: "Conflict Reduction", value: "65%" },
        { label: "Species Protected", value: "5 endangered" }
      ],
      client: "East African Wildlife Foundation",
      duration: "32 months",
      location: "Kenya & Tanzania"
    }
  ];

  const galleryItems = [
    {
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop",
      title: "Solar Farm Development",
      description: "Large-scale renewable energy project in the Mojave Desert providing clean power to 180,000 homes",
      location: "California, USA",
      category: "Renewable Energy",
      impact: "420MW capacity, 500,000 tons CO2 avoided annually"
    },
    {
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
      title: "Wind Energy Infrastructure",
      description: "Offshore wind farm installation featuring 75 turbines generating sustainable electricity for coastal communities",
      location: "North Sea, Denmark",
      category: "Wind Power",
      impact: "600MW capacity, powers 450,000 homes"
    },
    {
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&h=600&fit=crop",
      title: "Mountain Ecosystem Protection",
      description: "Conservation initiative protecting alpine biodiversity and watershed systems across 250,000 acres of pristine mountain habitat",
      location: "Rocky Mountains, USA",
      category: "Conservation",
      impact: "12 endangered species protected, 3 watersheds preserved"
    },
    {
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
      title: "Alpine Forest Restoration",
      description: "Reforestation program restoring fire-damaged alpine forests with native species, enhancing carbon sequestration",
      location: "Swiss Alps",
      category: "Reforestation",
      impact: "15,000 acres restored, 2M trees planted"
    },
    {
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      title: "Tropical Rainforest Conservation",
      description: "Protecting primary rainforest ecosystems, supporting indigenous communities, and maintaining critical carbon sinks",
      location: "Amazon Basin, Peru",
      category: "Rainforest Protection",
      impact: "500,000 acres protected, 45,000 tons CO2/year"
    },
    {
      image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=600&fit=crop",
      title: "Wetland Ecosystem Recovery",
      description: "Restoring degraded wetlands to enhance water filtration, flood control, and habitat for migratory birds",
      location: "Florida Everglades, USA",
      category: "Wetland Restoration",
      impact: "25,000 acres restored, 200+ bird species supported"
    }
  ];

  // Calculate totalSlides based on itemsPerSlide
  const totalSlides = Math.ceil(successStories.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop"
            alt="Nature background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              Transform Reports into<br className="hidden sm:block" />
              <span className="text-[#2dd4a1]">Actionable Intelligence</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed px-4">
              AI-powered environmental analysis that helps governments, NGOs, and researchers 
              make data-driven decisions in seconds, not weeks.
            </p>
          </motion.div>

          {/* CTA Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-2 sm:px-0">
            {[
              {
                title: "AI-Powered Analysis",
                description: "Upload environmental reports in PDF format and receive comprehensive analysis powered by Google's Gemini 2.5 Flash. Get insights on pollution sources, health risks, and policy recommendations in seconds.",
                link: "/analyze",
                delay: 0.2,
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
                badge: "Most Popular"
              },
              {
                title: "Smart Document Processing",
                description: "Our advanced AI extracts key metrics, identifies critical patterns, and structures complex environmental data into clear, actionable reports ready for decision-makers.",
                link: "/dashboard",
                delay: 0.3,
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              },
              {
                title: "Interactive Q&A",
                description: "Ask questions about your documents and get instant answers. Our conversational AI helps you dive deeper into specific sections, clarify findings, and explore alternative solutions.",
                link: "/chat",
                delay: 0.4,
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
                badge: "New"
              },
              {
                title: "Built for Impact",
                description: "Designed for government agencies, environmental NGOs, research institutions, and policy advisors who need fast, accurate environmental intelligence to drive change.",
                link: "/about",
                delay: 0.5,
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: card.delay }}
                whileHover={{ y: -8 }}
                className="group h-full"
              >
                <Link
                  to={card.link}
                  className="flex flex-col h-full relative overflow-hidden bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/30 hover:border-[#2dd4a1]/40"
                >
                  {/* Card Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Badge */}
                    {card.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: card.delay + 0.3, type: "spring" }}
                        className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 px-2 sm:px-3 py-1 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] text-white text-xs font-bold rounded-full shadow-lg"
                      >
                        {card.badge}
                      </motion.div>
                    )}

                    {/* Icon with Subtle Background */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1f7a63] to-[#2dd4a1] flex items-center justify-center mb-4 sm:mb-6 text-white shadow-lg group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {card.icon}
                      </svg>
                    </div>

                    {/* Title with Arrow */}
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white dark:text-white mb-3 sm:mb-4 flex items-center justify-between">
                      <span className="pr-2">{card.title}</span>
                      <svg 
                        className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300 leading-relaxed flex-grow">
                      {card.description}
                    </p>
                  </div>

                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                      backgroundSize: '24px 24px'
                    }}></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Main CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center mt-10 sm:mt-12 lg:mt-16 px-4"
          >
            <Link
              to="/analyze"
              className="inline-block px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 bg-[#1f7a63] hover:bg-[#2dd4a1] text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg lg:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              START YOUR FREE ANALYSIS
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-white/70"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Secondary Section - Big Wins Card */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2560&auto=format&fit=crop"
            alt="Conservation background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 shadow-2xl border border-white/20 dark:border-gray-700/30"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white dark:text-white mb-4 sm:mb-6">
              Trusted by Leading<br className="sm:hidden" /> Environmental<br className="hidden sm:block lg:hidden" /> Organizations
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2">
              Government agencies and NGOs worldwide use GreenGPT to accelerate 
              environmental research and policy development.
            </p>
            <Link
              to="/analyze"
              className="inline-block px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-[#1f7a63] hover:bg-[#2dd4a1] text-white rounded-lg font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              ANALYZE YOUR FIRST REPORT
            </Link>
          </motion.div>

          {/* Explore Dashboard Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 sm:mt-12"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-white hover:text-[#2dd4a1] font-semibold text-base sm:text-lg transition-colors group"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              VIEW SAMPLE DASHBOARD
              <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-3 sm:mb-4"
          >
            How GreenGPT Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg lg:text-xl text-center text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto px-4"
          >
            AI-powered environmental intelligence in three simple steps
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
                title: "Upload Document",
                description: "Upload your environmental or pollution report in PDF format. We support documents up to 10MB."
              },
              {
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                title: "AI Analysis",
                description: "Our advanced AI processes and extracts key insights, identifying pollution sources and health risks."
              },
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Get Insights",
                description: "Receive structured reports with actionable recommendations ready for policy decisions."
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -10 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#1f7a63] to-[#2dd4a1] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="inline-block px-3 sm:px-4 py-1 bg-[#e6f4ef]/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-[#1f7a63] dark:text-[#2dd4a1] mb-3 sm:mb-4">
                    Step {idx + 1}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-48 sm:w-64 h-48 sm:h-64 bg-[#2dd4a1] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-56 sm:w-72 h-56 sm:h-72 bg-[#1f7a63] rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Choose Your Plan
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4">
              Start your environmental analysis journey with a plan that fits your needs
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                id: "free_trial",
                name: "Free Trial",
                price: "$0",
                period: "7 days",
                description: "Test our platform",
                features: [
                  "5 document analyses",
                  "Basic AI insights",
                  "Email support",
                  "Report templates"
                ],
                buttonText: "Start Free Trial",
                buttonLink: "/signup",
                popular: false
              },
              {
                id: "individual",
                name: "Individual",
                price: "$49",
                period: "month",
                description: "For researchers",
                features: [
                  "Unlimited analyses",
                  "Advanced AI insights",
                  "Priority support",
                  "Custom templates",
                  "Export formats",
                  "API access"
                ],
                buttonText: "Get Started",
                buttonLink: "/signup",
                popular: true
              },
              {
                id: "team",
                name: "Organization",
                price: "$299",
                period: "month",
                description: "For enterprises",
                features: [
                  "All Individual features",
                  "Unlimited teams",
                  "Account manager",
                  "24/7 support",
                  "Custom AI training",
                  "White-label reports"
                ],
                buttonText: "Contact Sales",
                buttonLink: "/contact",
                popular: false
              }
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-[8px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full flex justify-center px-4 sm:px-0 sm:w-auto">
                    <div className="px-5 py-1.5 bg-gradient-to-r from-[#2dd4a1] to-[#1f7a63] text-white text-xs font-bold rounded-full shadow-lg text-center">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Card with glassmorphism - Fixed height */}
                <div className={`flex flex-col backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 h-[480px] ${
                  plan.popular 
                    ? 'border-[#2dd4a1] bg-white/90 dark:bg-gray-800/90 scale-105' 
                    : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:border-[#2dd4a1]/50'
                }`}>
                  
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-br ${plan.popular ? 'from-[#1f7a63] to-[#155744]' : 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'} px-6 py-6 text-center ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <p className={`text-xs mb-4 ${plan.popular ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        / {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features list - flex-grow to fill space */}
                  <div className="flex flex-col flex-grow px-6 py-5">
                    <ul className="space-y-2.5 flex-grow mb-5">
                      {plan.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-[#2dd4a1] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePlanSelection(plan.id, plan.name, plan.price)}
                      className={`block w-full py-3 rounded-xl font-semibold text-center text-sm transition-all duration-300 transform group-hover:scale-105 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] hover:from-[#2dd4a1] hover:to-[#1f7a63] text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-[#1f7a63] hover:to-[#2dd4a1] text-gray-900 dark:text-white hover:text-white'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>

                  {/* Glassmorphism overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>Email support included</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases - Themes Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Use Cases & Applications
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              GreenGPT adapts to various environmental analysis needs across different sectors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Air Quality & Pollution",
                description: "Analyze air quality reports, identify pollution sources, assess health risks, and get actionable recommendations.",
                image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=400&fit=crop",
                color: "from-blue-400 to-cyan-500"
              },
              {
                title: "Water Resource Management",
                description: "Evaluate water quality data, track contamination sources, analyze watershed health, and develop conservation policies.",
                image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
                color: "from-teal-400 to-green-500"
              },
              {
                title: "Climate Impact Assessment",
                description: "Process climate reports, identify vulnerable regions, evaluate mitigation strategies, and support policy development.",
                image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop",
                color: "from-green-400 to-emerald-500"
              }
            ].map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group h-full"
              >
                <div className="h-full flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-300 dark:border-gray-700/50">
                  {/* Circular Image */}
                  <div className="flex justify-center pt-8 pb-6">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                      <img
                        src={useCase.image}
                        alt={useCase.title}
                        className="relative w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-8 pb-8 text-center flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                      {useCase.description}
                    </p>
                    <Link
                      to="/analyze"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] hover:from-[#2dd4a1] hover:to-[#1f7a63] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Try Analysis
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories - Carousel Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 px-2">
              Success Stories
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
              Real-world impact of AI-powered environmental analysis
            </p>
          </motion.div>

          <div className="relative max-w-7xl mx-auto">
            {/* Mobile: Static Grid - Desktop: Carousel */}
            <div className="md:hidden">
              <div className="grid grid-cols-1 gap-6 py-8 px-4">
                {successStories.slice(0, 3).map((story, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ 
                      scale: 1.03, 
                      y: -4,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    onClick={() => setSelectedCaseStudy(story)}
                    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-[#2dd4a1]/50 transition-all duration-300 group h-full flex flex-col cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1.5 bg-[#2dd4a1]/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                          {story.tag}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold text-[#1f7a63] dark:text-[#2dd4a1]">{story.impact}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#1f7a63] dark:group-hover:text-[#2dd4a1] transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow text-sm">
                        {story.description}
                      </p>
                      <button
                        onClick={() => setSelectedCaseStudy(story)}
                        className="inline-flex items-center text-[#1f7a63] dark:text-[#2dd4a1] font-semibold hover:gap-2 transition-all duration-300 text-sm"
                      >
                        Read Case Study
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Desktop: Carousel Container */}
            <div className="hidden md:block">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIdx) => (
                  <div key={slideIdx} className="w-full flex-shrink-0 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                      {successStories
                        .slice(slideIdx * itemsPerSlide, (slideIdx + 1) * itemsPerSlide)
                        .map((story, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ 
                              scale: 1.03, 
                              y: -4,
                              transition: { duration: 0.3, ease: "easeOut" }
                            }}
                            onClick={() => setSelectedCaseStudy(story)}
                            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-[#2dd4a1]/50 transition-all duration-300 group h-full flex flex-col cursor-pointer"
                          >
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                              <img
                                src={story.image}
                                alt={story.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1.5 bg-[#2dd4a1]/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                  {story.tag}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-grow">
                              <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-semibold text-[#1f7a63] dark:text-[#2dd4a1]">{story.impact}</span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#1f7a63] dark:group-hover:text-[#2dd4a1] transition-colors">
                                {story.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow text-sm">
                                {story.description}
                              </p>
                              <button
                                onClick={() => setSelectedCaseStudy(story)}
                                className="inline-flex items-center text-[#1f7a63] dark:text-[#2dd4a1] font-semibold hover:gap-2 transition-all duration-300 text-sm"
                              >
                                Read Case Study
                                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - Desktop Only */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-[#1f7a63] hover:text-white dark:hover:bg-[#2dd4a1] transition-all duration-300 group z-10"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-[#1f7a63] hover:text-white dark:hover:bg-[#2dd4a1] transition-all duration-300 group z-10"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot Indicators - Desktop Only */}
            <div className="flex justify-center gap-3 mt-8">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === idx
                      ? 'w-10 h-3 bg-[#1f7a63] dark:bg-[#2dd4a1]'
                      : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Magazine-Style Hero Section - GreenGPT Insights */}
      <section id="case-studies-section" className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[550px] flex items-center justify-center overflow-hidden py-12 sm:py-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1600&h=900&fit=crop"
            alt="Magazine background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2dd4a1]/90 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              GREENGPT INSIGHTS
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
              The Future of Environmental Analysis
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto px-2">
              Discover how AI-powered analysis is transforming environmental research, enabling faster decisions and more effective policy implementation across the globe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <button
                onClick={() => setShowCaseStudySelector(true)}
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#1f7a63] rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base"
              >
                EXPLORE CASE STUDIES
              </button>
              <Link
                to="/about"
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white hover:bg-white hover:text-[#1f7a63] rounded-lg font-bold transition-all duration-300 text-sm sm:text-base"
              >
                MORE INSIGHTS
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Showcase - Photo Gallery Style */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 px-2">
              Our Impact in Action
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
              Supporting environmental initiatives worldwide through intelligent analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryItems.slice(0, window.innerWidth < 768 ? 4 : galleryItems.length).map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedGalleryImage(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f7a63]/90 via-[#1f7a63]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-6 text-center">
                  <span className="px-3 py-1 bg-[#2dd4a1] text-white text-xs font-semibold rounded-full mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-white/90 text-sm">{item.location}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => setShowGallerySelector(true)}
              className="px-8 py-4 bg-[#1f7a63] hover:bg-[#155744] text-white font-semibold rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              EXPLORE GALLERY
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Section Title */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-2">
              Why Organizations Choose GreenGPT
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
              Trusted by government agencies, NGOs, and research institutions worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* Split-Screen Feature Section 1 */}
      <section className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
        <div className="w-full flex flex-col md:grid md:grid-cols-2">
          {/* Text Side */}
          <div className="bg-gradient-to-br from-[#1f7a63] to-[#155744] flex items-center justify-center p-6 sm:p-8 md:p-12 order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-xl text-center md:text-left"
            >
              <div className="w-12 h-1 bg-[#2dd4a1] mb-4 mx-auto md:mx-0"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                A New Era for Environmental Intelligence
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 leading-relaxed">
                Government agencies and organizations worldwide trust GreenGPT to analyze thousands of environmental reports—a historic milestone for data-driven environmental policy and global sustainability governance.
              </p>
              <Link
                to="/about"
                className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-[#2dd4a1] hover:bg-white hover:text-[#1f7a63] text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
              >
                READ ABOUT THE TECHNOLOGY
              </Link>
            </motion.div>
          </div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative h-64 sm:h-80 md:h-full order-1 md:order-2"
          >
            <img
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop"
              alt="Ocean conservation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1f7a63]/30 to-transparent"></div>
          </motion.div>
        </div>
      </section>

      {/* Split-Screen Feature Section 2 - Reversed */}
      <section className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
        <div className="w-full flex flex-col md:grid md:grid-cols-2">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative h-64 sm:h-80 md:h-full order-1"
          >
            <img
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop"
              alt="Forest landscape"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#2dd4a1]/30 to-transparent"></div>
          </motion.div>

          {/* Text Side */}
          <div className="bg-gradient-to-br from-[#2dd4a1] to-[#1f7a63] flex items-center justify-center p-6 sm:p-8 md:p-12 order-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-xl text-center md:text-left"
            >
              <div className="w-12 h-1 bg-white mb-4 mx-auto md:mx-0"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Real-Time Climate Data Analysis
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 leading-relaxed">
                After years of environmental research collaboration, GreenGPT announces breakthrough capabilities in processing complex climate reports and pollution data—creating actionable insights for policymakers worldwide.
              </p>
              <Link
                to="/analyze"
                className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-[#1f7a63] hover:bg-gray-100 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
              >
                TRY ANALYSIS NOW
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Environmental Impact Statistics Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2dd4a1] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1f7a63] rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block px-3 py-1.5 bg-[#2dd4a1]/10 dark:bg-[#2dd4a1]/20 rounded-full text-[#1f7a63] dark:text-[#2dd4a1] text-xs font-semibold mb-3">
              Our Impact
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 px-2">
              Global Environmental Impact
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
              Empowering organizations worldwide to make data-driven environmental decisions
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {[
              { 
                number: "500+", 
                label: "Organizations Served",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              { 
                number: "50K+", 
                label: "Reports Analyzed",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              { 
                number: "120+", 
                label: "Countries Reached",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              { 
                number: "2M+", 
                label: "Tons CO₂ Reduced",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group"
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center text-center">
                  {/* Icon Container */}
                  <div className="mb-4 p-3 bg-gradient-to-br from-[#1f7a63]/10 to-[#2dd4a1]/10 dark:from-[#1f7a63]/20 dark:to-[#2dd4a1]/20 rounded-xl text-[#1f7a63] dark:text-[#2dd4a1] group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  
                  {/* Number */}
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  
                  {/* Label */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trusted By Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="inline-block px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 mb-6">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                Trusted by Leading Environmental Organizations
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 sm:gap-8">
              {["UN Environment", "WWF", "Greenpeace", "EPA", "Conservation Int'l"].map((org, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-[#2dd4a1]/30 transition-all duration-300 text-center"
                >
                  <span className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300">
                    {org}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Ready to Get Started Section */}
      <section className="py-20 bg-gradient-to-br from-[#1a5d4a] to-[#0f3d2f]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-4 leading-relaxed max-w-3xl mx-auto">
              Join hundreds of organizations using GreenGPT for environmental intelligence. 
              Start analyzing your first document today.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Quick Start Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 text-center sm:text-left">
                <svg className="w-12 h-12 sm:w-8 sm:h-8 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Get Started Instantly</h3>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                Upload your environmental report and get AI-powered insights in seconds. No credit card required for your first analysis.
              </p>
              <Link
                to="/analyze"
                className="block w-full text-center px-8 py-4 bg-white text-[#1f7a63] rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Start Free Analysis
              </Link>
            </motion.div>

            {/* Newsletter Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 text-center sm:text-left">
                <svg className="w-12 h-12 sm:w-8 sm:h-8 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Stay Updated</h3>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                Get the latest environmental insights, AI analysis tips, and sustainability news delivered to your inbox.
              </p>
              <form className="space-y-3" onSubmit={(e) => {
                e.preventDefault();
              }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full px-8 py-3 bg-white text-[#1f7a63] rounded-lg font-bold hover:bg-gray-100 transition-all duration-300"
                >
                  Subscribe to Newsletter
                </button>
              </form>
              <p className="text-white/60 text-xs mt-3 text-center">
                Join 10,000+ environmental professionals
              </p>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="flex flex-wrap justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free Trial Available</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Instant Results</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Study Modal */}
      {selectedCaseStudy && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-8 overflow-y-auto"
          onClick={() => setSelectedCaseStudy(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-5">
              {/* Image Side - Left */}
              <div className="relative md:col-span-2 h-64 md:h-auto">
                <img
                  src={selectedCaseStudy.image}
                  alt={selectedCaseStudy.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <button
                  onClick={() => setSelectedCaseStudy(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-3 py-1.5 bg-[#2dd4a1] text-white text-sm font-semibold rounded-full mb-3">
                    {selectedCaseStudy.tag}
                  </span>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {selectedCaseStudy.location}
                  </div>
                </div>
              </div>

              {/* Content Side - Right */}
              <div className="md:col-span-3 p-8 md:p-10 max-h-[calc(100vh-16rem)] overflow-y-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedCaseStudy.title}
                </h2>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {selectedCaseStudy.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                      <div className="text-xl font-bold text-[#1f7a63] dark:text-[#2dd4a1] mb-1">
                        {metric.value}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Project Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Project Overview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedCaseStudy.fullDescription}
                  </p>
                </div>

                {/* Client & Duration Info */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200 dark:border-gray-700 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Client</div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {selectedCaseStudy.client}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Project Duration</div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {selectedCaseStudy.duration}
                    </div>
                  </div>
                </div>

                {/* Impact Badge */}
                <div className="p-4 bg-gradient-to-r from-[#1f7a63]/10 to-[#2dd4a1]/10 dark:from-[#1f7a63]/20 dark:to-[#2dd4a1]/20 rounded-xl border border-[#2dd4a1]/30 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1f7a63] to-[#2dd4a1] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total Impact</div>
                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        {selectedCaseStudy.impact}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex gap-3">
                  <Link
                    to="/analyze"
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] hover:from-[#2dd4a1] hover:to-[#1f7a63] text-white rounded-xl font-semibold text-center transition-all transform hover:scale-105 shadow-lg text-sm"
                  >
                    Start Your Analysis
                  </Link>
                  <Link
                    to="/contact"
                    className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all text-sm"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Gallery Modal */}
      {selectedGalleryImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedGalleryImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              {/* Image Side */}
              <div className="relative h-64 md:h-auto">
                <img
                  src={selectedGalleryImage.image}
                  alt={selectedGalleryImage.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedGalleryImage(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content Side */}
              <div className="p-8">
                <span className="inline-block px-3 py-1.5 bg-[#2dd4a1] text-white text-sm font-semibold rounded-full mb-4">
                  {selectedGalleryImage.category}
                </span>
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedGalleryImage.title}
                </h2>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {selectedGalleryImage.location}
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-6">
                  {selectedGalleryImage.description}
                </p>

                <div className="p-4 bg-gradient-to-r from-[#1f7a63]/10 to-[#2dd4a1]/10 dark:from-[#1f7a63]/20 dark:to-[#2dd4a1]/20 rounded-xl border border-[#2dd4a1]/30 mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Environmental Impact</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedGalleryImage.impact}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/analyze"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] hover:from-[#2dd4a1] hover:to-[#1f7a63] text-white rounded-xl font-semibold text-center transition-all transform hover:scale-105"
                  >
                    Analyze Similar Project
                  </Link>
                  <Link
                    to="/about"
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Case Study Selector Modal */}
      {showCaseStudySelector && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-8 overflow-y-auto"
          onClick={() => setShowCaseStudySelector(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#1f7a63] to-[#155744] p-8">
              <button
                onClick={() => setShowCaseStudySelector(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Explore Our Case Studies
              </h2>
              <p className="text-white/90 text-lg">
                Select a case study to learn more about real-world environmental impact
              </p>
            </div>

            {/* Case Studies Grid */}
            <div className="p-8 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {successStories.map((story, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    onClick={() => {
                      setShowCaseStudySelector(false);
                      setSelectedCaseStudy(story);
                    }}
                    className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600 hover:border-[#2dd4a1] transition-all cursor-pointer group"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-[#2dd4a1] text-white text-xs font-semibold rounded-full">
                        {story.tag}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2 text-white text-xs">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">{story.impact}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#1f7a63] dark:group-hover:text-[#2dd4a1] transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
                        {story.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">{story.location}</span>
                        <svg className="w-5 h-5 text-[#2dd4a1] group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Gallery Selector Modal */}
      {showGallerySelector && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-8 overflow-y-auto"
          onClick={() => setShowGallerySelector(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#1f7a63] to-[#155744] p-8">
              <button
                onClick={() => setShowGallerySelector(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Explore Our Gallery
              </h2>
              <p className="text-white/90 text-lg">
                Select a project to learn more about our environmental initiatives
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="p-8 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    onClick={() => {
                      setShowGallerySelector(false);
                      setSelectedGalleryImage(item);
                    }}
                    className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600 hover:border-[#2dd4a1] transition-all cursor-pointer group"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-[#2dd4a1] text-white text-xs font-semibold rounded-full">
                        {item.category}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                        <p className="text-white/90 text-xs">{item.location}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#1f7a63] dark:text-[#2dd4a1] text-xs font-semibold">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{item.impact}</span>
                        </div>
                        <svg className="w-5 h-5 text-[#2dd4a1] group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setShowSuccessModal(false);
            navigate('/profile');
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
          >
            {/* Success Animation Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2dd4a1]/10 to-[#1f7a63]/10 pointer-events-none"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-[#2dd4a1] to-[#1f7a63] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              {/* Success Message */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
              >
                Plan Selected Successfully!
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-300 mb-6"
              >
                You've successfully selected the <span className="font-bold text-[#1f7a63] dark:text-[#2dd4a1]">{selectedPlan?.name}</span> plan.
              </motion.p>

              {/* Plan Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Selected Plan:</span>
                  <span className="text-gray-900 dark:text-white font-bold">{selectedPlan?.name}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Price:</span>
                  <span className="text-[#1f7a63] dark:text-[#2dd4a1] font-bold text-lg">{selectedPlan?.price}</span>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/profile');
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#1f7a63] to-[#2dd4a1] hover:from-[#2dd4a1] hover:to-[#1f7a63] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Go to Profile
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
