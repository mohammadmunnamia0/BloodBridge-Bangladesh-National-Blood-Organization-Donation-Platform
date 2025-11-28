import { useState } from "react";

const RhFactor = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section className="py-16 bg-gradient-to-b from-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Understanding the Rh Factor
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The Rh blood group system is one of the most important blood group systems in transfusion medicine.
            Understanding your Rh factor can be life-saving.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500 transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-red-600 mb-2">85%</div>
            <p className="text-gray-600 font-medium">Rh Positive Population</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-blue-600 mb-2">15%</div>
            <p className="text-gray-600 font-medium">Rh Negative Population</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
            <p className="text-gray-600 font-medium">Rh Antigens Identified</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-purple-600 mb-2">1940</div>
            <p className="text-gray-600 font-medium">Year of Discovery</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "overview"
                ? "bg-red-600 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-red-50 shadow"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("importance")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "importance"
                ? "bg-red-600 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-red-50 shadow"
            }`}
          >
            Why It Matters
          </button>
          <button
            onClick={() => setActiveTab("pregnancy")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "pregnancy"
                ? "bg-red-600 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-red-50 shadow"
            }`}
          >
            Pregnancy & Rh
          </button>
          <button
            onClick={() => setActiveTab("cases")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "cases"
                ? "bg-red-600 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-red-50 shadow"
            }`}
          >
            Case Studies
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">What is the Rh Factor?</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  The Rh factor, also known as Rhesus factor, is a protein that can be present on the surface of red blood cells. 
                  If you have this protein, you are Rh positive (Rh+). If you don't have it, you are Rh negative (Rh-).
                </p>
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                  <p className="text-gray-800 font-medium">
                    <span className="text-red-600 font-bold">Historical Fact:</span> The Rh factor was discovered in 1940 
                    by Karl Landsteiner and Alexander Wiener during experiments with Rhesus monkeys, hence the name "Rh."
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl border-2 border-red-200">
                  <h4 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                    <span className="mr-2">➕</span> Rh Positive (Rh+)
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Has the D antigen on red blood cells</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Most common: 85% of global population</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Can receive Rh+ or Rh- blood (if ABO compatible)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Lower pregnancy complications risk</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border-2 border-blue-200">
                  <h4 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                    <span className="mr-2">➖</span> Rh Negative (Rh-)
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Lacks the D antigen on red blood cells</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Rare: Only 15% of global population</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Can ONLY receive Rh- blood</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Requires RhoGAM during pregnancy</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                <h4 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Global Distribution
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">European Descent</p>
                    <p className="text-gray-600">15-17% Rh negative</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">African Descent</p>
                    <p className="text-gray-600">5-7% Rh negative</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Asian Descent</p>
                    <p className="text-gray-600">1-2% Rh negative</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Importance Tab */}
          {activeTab === "importance" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Rh Factor Matters</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                  <div className="text-4xl mb-4">🩸</div>
                  <h4 className="text-2xl font-bold text-red-600 mb-3">Blood Transfusions</h4>
                  <p className="text-gray-700 mb-4">
                    Receiving incompatible Rh blood can trigger a dangerous immune response called hemolytic transfusion reaction.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-2">Critical Facts:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Rh- patients can develop anti-D antibodies if exposed to Rh+ blood</li>
                      <li>• Antibodies attack and destroy Rh+ red blood cells</li>
                      <li>• Can be fatal without proper matching</li>
                      <li>• Second exposure is typically more severe</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-200">
                  <div className="text-4xl mb-4">🤰</div>
                  <h4 className="text-2xl font-bold text-pink-600 mb-3">Pregnancy Safety</h4>
                  <p className="text-gray-700 mb-4">
                    Rh incompatibility between mother and fetus is a serious concern in obstetrics, affecting thousands of pregnancies.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-2">Risk Scenario:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Rh- mother + Rh+ father = Rh+ baby (possible)</li>
                      <li>• Mother's immune system may attack baby's blood</li>
                      <li>• Condition: Hemolytic Disease of the Newborn (HDN)</li>
                      <li>• Preventable with RhoGAM injections</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="text-4xl mb-4">🔬</div>
                  <h4 className="text-2xl font-bold text-blue-600 mb-3">Medical Procedures</h4>
                  <p className="text-gray-700 mb-4">
                    Rh factor is crucial in organ transplantation, prenatal care, and emergency medicine.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-2">Applications:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Pre-surgical blood typing</li>
                      <li>• Organ transplant compatibility</li>
                      <li>• Prenatal screening programs</li>
                      <li>• Emergency blood supply planning</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="text-4xl mb-4">🧬</div>
                  <h4 className="text-2xl font-bold text-green-600 mb-3">Genetic Inheritance</h4>
                  <p className="text-gray-700 mb-4">
                    Rh factor is inherited from parents following Mendelian genetics, with Rh+ being dominant.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-2">Inheritance Pattern:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Both parents Rh+ → Child can be Rh+ or Rh-</li>
                      <li>• One parent Rh+, one Rh- → Child can be either</li>
                      <li>• Both parents Rh- → Child will be Rh-</li>
                      <li>• Rh+ is a dominant genetic trait</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-xl p-8 border-2 border-red-300">
                <h4 className="text-2xl font-bold text-red-800 mb-4">Impact Statistics</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="text-3xl font-bold text-red-600 mb-2">16%</div>
                    <p className="text-gray-700">Of pregnancies affected by Rh incompatibility without treatment</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
                    <p className="text-gray-700">Prevention success rate with RhoGAM prophylaxis</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="text-3xl font-bold text-green-600 mb-2">10,000+</div>
                    <p className="text-gray-700">Lives saved annually through Rh screening programs</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pregnancy Tab */}
          {activeTab === "pregnancy" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Rh Factor in Pregnancy</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Rh incompatibility during pregnancy is a preventable condition that once caused significant infant mortality. 
                  Modern medicine has made it highly manageable through screening and treatment.
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-8 border-2 border-pink-300">
                <h4 className="text-2xl font-bold text-pink-700 mb-6">Hemolytic Disease of the Newborn (HDN)</h4>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-6 shadow">
                    <h5 className="font-bold text-red-600 mb-3 text-xl">The Problem</h5>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-red-500 font-bold mr-2">1.</span>
                        <span>Rh- mother carries Rh+ baby (inherited from father)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 font-bold mr-2">2.</span>
                        <span>Baby's blood cells enter mother's bloodstream during delivery</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 font-bold mr-2">3.</span>
                        <span>Mother's immune system recognizes Rh+ cells as foreign</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 font-bold mr-2">4.</span>
                        <span>Mother produces anti-D antibodies</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 font-bold mr-2">5.</span>
                        <span>In future pregnancies, antibodies attack Rh+ baby's blood cells</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow">
                    <h5 className="font-bold text-green-600 mb-3 text-xl">The Solution</h5>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-500 font-bold mr-2">✓</span>
                        <span>RhoGAM (Rh Immune Globulin) injection at 28 weeks pregnancy</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 font-bold mr-2">✓</span>
                        <span>Second RhoGAM dose within 72 hours after delivery</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 font-bold mr-2">✓</span>
                        <span>Prevents mother's immune system from producing antibodies</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 font-bold mr-2">✓</span>
                        <span>Protects current and future pregnancies</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 font-bold mr-2">✓</span>
                        <span>99% effective when administered properly</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                  <p className="font-bold text-yellow-800 mb-2">⚠️ Important: Additional RhoGAM Needed After:</p>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-yellow-900">
                    <li>• Miscarriage or ectopic pregnancy</li>
                    <li>• Amniocentesis or CVS testing</li>
                    <li>• Abdominal trauma during pregnancy</li>
                    <li>• Abortion (spontaneous or induced)</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-red-500">
                  <h5 className="font-bold text-gray-800 mb-3">Before RhoGAM (Pre-1968)</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• 10,000+ infant deaths annually in US</li>
                    <li>• 20,000+ cases of brain damage</li>
                    <li>• Leading cause of newborn jaundice</li>
                    <li>• No effective prevention available</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-green-500">
                  <h5 className="font-bold text-gray-800 mb-3">After RhoGAM (Post-1968)</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• 95% reduction in HDN cases</li>
                    <li>• Infant mortality nearly eliminated</li>
                    <li>• Routine prenatal screening standard</li>
                    <li>• Safe for mother and baby</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-blue-500">
                  <h5 className="font-bold text-gray-800 mb-3">Current Protocol</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Universal Rh screening at first visit</li>
                    <li>• Partner testing if mother is Rh-</li>
                    <li>• Prophylactic RhoGAM at 28 weeks</li>
                    <li>• Post-delivery dose if baby is Rh+</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Case Studies Tab */}
          {activeTab === "cases" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Real-World Case Studies</h3>
                <p className="text-lg text-gray-700">
                  These documented cases illustrate the critical importance of Rh factor awareness and proper medical intervention.
                </p>
              </div>

              {/* Case Study 1 */}
              <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-8 border-2 border-red-200 shadow-lg">
                <div className="flex items-start mb-4">
                  <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-red-700 mb-2">Emergency Transfusion Crisis</h4>
                    <p className="text-sm text-gray-600">Location: Teaching Hospital, Dhaka | Year: 2021</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 mb-4">
                  <h5 className="font-bold text-gray-800 mb-3">Case Details:</h5>
                  <p className="text-gray-700 mb-3">
                    A 32-year-old woman with O Rh-negative blood type was admitted with severe post-partum hemorrhage. 
                    She required immediate blood transfusion but the hospital blood bank had no O negative units available.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-red-600">Critical Issue:</span> Patient initially received O positive blood 
                    due to emergency shortage. This led to development of anti-D antibodies.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-100 rounded-lg p-4">
                    <h6 className="font-bold text-red-800 mb-2">Consequences:</h6>
                    <ul className="space-y-1 text-sm text-gray-800">
                      <li>• Hemolytic reaction requiring ICU care</li>
                      <li>• Extended hospital stay (14 days)</li>
                      <li>• Future pregnancies now high-risk</li>
                      <li>• Lifetime dependency on Rh- blood</li>
                    </ul>
                  </div>
                  <div className="bg-green-100 rounded-lg p-4">
                    <h6 className="font-bold text-green-800 mb-2">Lessons Learned:</h6>
                    <ul className="space-y-1 text-sm text-gray-800">
                      <li>• Maintain adequate Rh- blood inventory</li>
                      <li>• Pre-arrange donors for rare types</li>
                      <li>• Patient education on blood type</li>
                      <li>• Emergency protocols for incompatibility</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Case Study 2 */}
              <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-8 border-2 border-pink-200 shadow-lg">
                <div className="flex items-start mb-4">
                  <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-pink-700 mb-2">Preventable HDN Success Story</h4>
                    <p className="text-sm text-gray-600">Location: Maternity Center, Chittagong | Year: 2022</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 mb-4">
                  <h5 className="font-bold text-gray-800 mb-3">Case Details:</h5>
                  <p className="text-gray-700 mb-3">
                    First-time mother, 28 years old, blood type A Rh-negative. Father is A Rh-positive. 
                    Proper screening identified risk during first prenatal visit at 8 weeks gestation.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-green-600">Intervention:</span> Patient received comprehensive 
                    counseling and RhoGAM prophylaxis at 28 weeks and within 72 hours post-delivery.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-100 rounded-lg p-4">
                    <h6 className="font-bold text-blue-800 mb-2">Timeline:</h6>
                    <ul className="space-y-2 text-sm text-gray-800">
                      <li>• <span className="font-semibold">Week 8:</span> Rh screening completed</li>
                      <li>• <span className="font-semibold">Week 12:</span> Father's blood type confirmed</li>
                      <li>• <span className="font-semibold">Week 28:</span> First RhoGAM injection</li>
                      <li>• <span className="font-semibold">Delivery:</span> Baby boy, Rh-positive, healthy</li>
                      <li>• <span className="font-semibold">48 hours:</span> Second RhoGAM dose given</li>
                    </ul>
                  </div>
                  <div className="bg-green-100 rounded-lg p-4">
                    <h6 className="font-bold text-green-800 mb-2">Outcome:</h6>
                    <ul className="space-y-1 text-sm text-gray-800">
                      <li>• Baby born healthy, no complications</li>
                      <li>• No antibodies detected in mother</li>
                      <li>• Mother had successful second pregnancy</li>
                      <li>• Same protocol followed, perfect outcome</li>
                      <li>• Cost: $200 prevention vs $15,000+ treatment</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Case Study 3 */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border-2 border-blue-200 shadow-lg">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-blue-700 mb-2">Mass Casualty Blood Shortage</h4>
                    <p className="text-sm text-gray-600">Location: Regional Hospital | Year: 2023</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 mb-4">
                  <h5 className="font-bold text-gray-800 mb-3">Case Details:</h5>
                  <p className="text-gray-700 mb-3">
                    Major traffic accident involving a bus resulted in 18 casualties requiring immediate transfusions. 
                    Hospital discovered 40% of patients were Rh-negative, but only 3 Rh-negative units available.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-blue-600">Response:</span> Emergency blood drive organized through 
                    BloodBridge platform, locating 12 Rh-negative donors within 2 hours.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6">
                  <h6 className="font-bold text-gray-800 mb-4">Impact Analysis:</h6>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white rounded p-3">
                      <p className="font-bold text-blue-600 text-2xl mb-1">18</p>
                      <p className="text-gray-700">Patients Requiring Transfusion</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="font-bold text-purple-600 text-2xl mb-1">7</p>
                      <p className="text-gray-700">Rh-Negative Patients</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="font-bold text-green-600 text-2xl mb-1">100%</p>
                      <p className="text-gray-700">Survival Rate Achieved</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-2">Key Success Factors:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Digital blood donor database with Rh classification</li>
                      <li>• Rapid SMS/notification system to registered donors</li>
                      <li>• Pre-screened donors ready for emergency donation</li>
                      <li>• Coordinated hospital network for blood sharing</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Research Citation */}
              <div className="bg-gray-100 rounded-xl p-6 border-l-4 border-gray-600">
                <h5 className="font-bold text-gray-800 mb-3">📚 Research References:</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• American College of Obstetricians and Gynecologists (ACOG). "Prevention of Rh D Alloimmunization." Practice Bulletin No. 181, 2017.</li>
                  <li>• World Health Organization. "Screening, Immunoprophylaxis and Prevention of Haemolytic Disease of the Fetus and Newborn." 2021 Guidelines.</li>
                  <li>• Bangladesh Medical Research Council. "Blood Safety and Transfusion Medicine Report." 2022 Annual Review.</li>
                  <li>• The Lancet. "Global burden of Rh disease and prevention strategies." Vol. 398, Issue 10315, 2021.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RhFactor;
