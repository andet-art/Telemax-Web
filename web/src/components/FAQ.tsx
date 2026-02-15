import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  const toggle = (index: number) => {
    setActiveIndex(prev => (prev === index ? null : index));
  };

  // ✅ Move t() usage INSIDE the render to make it reactive
  const faqs = [
    { q: t("faq_q1"), a: t("faq_a1") },
    { q: t("faq_q2"), a: t("faq_a2") },
    { q: t("faq_q3"), a: t("faq_a3") },
    { q: t("faq_q4"), a: t("faq_a4") },
  ];

  return (
    <div className="space-y-4">
      {faqs.map((item, index) => (
        <div key={index} className="bg-[#2a1d13] rounded-xl shadow-lg overflow-hidden transition-all">
          <button
            className="w-full text-left p-6 flex justify-between items-center text-lg font-medium focus:outline-none"
            onClick={() => toggle(index)}
            aria-expanded={activeIndex === index}
          >
            <span>{item.q}</span>
            <FaChevronDown
              className={`ml-4 transform transition-transform duration-300 ${
                activeIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`px-6 pb-6 text-stone-300 text-base transition-all duration-300 ease-in-out ${
              activeIndex === index ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {item.a}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
