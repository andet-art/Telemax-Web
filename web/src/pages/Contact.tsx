import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const response = await fetch("http://209.38.231.125:4000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Success:", result.message);
      setIsSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      });

      setTimeout(() => setIsSubmitted(false), 3000);
    } else {
      console.error("Failed to submit:", result.message);
      alert("Failed to send message. Please try again later.");
    }
  } catch (err) {
    console.error("Error submitting:", err);
    alert("Server error. Please try again later.");
  }

  setIsSubmitting(false);
};



  if (isSubmitted) {
    return (
      <div className="bg-[#1a120b] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-[#c9a36a] mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">{t('contact.success.title')}</h2>
          <p className="text-stone-300">{t('contact.success.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a120b] text-white min-h-screen font-serif">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#2a1810] via-[#1a120b] to-[#0f0a07] opacity-90"
        />
        <div className="absolute inset-0 opacity-30" />
      </div>
      <video
        src="/src/assets/artisan2.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none mt-18"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-stone-300 bg-clip-text text-transparent">
            {t('contact.header.title')}
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {t('contact.header.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-[#201b17] p-8 rounded-2xl shadow-2xl border border-stone-800">
              <h2 className="text-2xl font-bold mb-6 text-[#c9a36a]">{t('contact.info.title')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-[#c9a36a] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.info.email.label')}</h3>
                    <p className="text-stone-300">{t('contact.info.email.value')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-[#c9a36a] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.info.phone.label')}</h3>
                    <p className="text-stone-300">{t('contact.info.phone.value')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-[#c9a36a] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.info.address.label')}</h3>
                    <p className="text-stone-300">
                      {t('contact.info.address.street')}<br />
                      {t('contact.info.address.district')}<br />
                      {t('contact.info.address.city')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-[#c9a36a] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.info.hours.label')}</h3>
                    <p className="text-stone-300">
                      {t('contact.info.hours.weekdays')}<br />
                      {t('contact.info.hours.saturday')}<br />
                      {t('contact.info.hours.sunday')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#201b17] p-8 rounded-2xl shadow-2xl border border-stone-800">
              <h2 className="text-2xl font-bold mb-6 text-[#c9a36a]">{t('contact.form.title')}</h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold mb-2 text-white">
                      {t('contact.form.firstName.label')} *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c9a36a] focus:border-transparent transition-all duration-200"
                      placeholder={t('contact.form.firstName.placeholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold mb-2 text-white">
                      {t('contact.form.lastName.label')} *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c9a36a] focus:border-transparent transition-all duration-200"
                      placeholder={t('contact.form.lastName.placeholder')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2 text-white">
                      {t('contact.form.email.label')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c9a36a] focus:border-transparent transition-all duration-200"
                      placeholder={t('contact.form.email.placeholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold mb-2 text-white">
                      {t('contact.form.phone.label')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c9a36a] focus:border-transparent transition-all duration-200"
                      placeholder={t('contact.form.phone.placeholder')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold mb-2 text-white">
                      {t('contact.form.company.label')}
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c9a36a] focus:border-transparent transition-all duration-200"
                      placeholder={t('contact.form.company.placeholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-2 text-white">
                      {t('contact.form.subject.label')} *
                    </label>
                    <select
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-[#c9a36a] focus:border-transparent transition-all duration-200"
                    >
                      <option value="">{t('contact.form.subject.placeholder')}</option>
                      <option value="custom-order">{t('contact.form.subject.options.customOrder')}</option>
                      <option value="consultation">{t('contact.form.subject.options.consultation')}</option>
                      <option value="general-inquiry">{t('contact.form.subject.options.generalInquiry')}</option>
                      <option value="support">{t('contact.form.subject.options.support')}</option>
                      <option value="partnership">{t('contact.form.subject.options.partnership')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2 text-white">
                    {t('contact.form.message.label')} *
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c9a36a] focus:border-transparent transition-all duration-200 resize-none"
                    placeholder={t('contact.form.message.placeholder')}
                  />
                </div>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#c9a36a] to-[#b8915b] hover:from-[#b8915b] hover:to-[#a67f4a] disabled:opacity-50 disabled:cursor-not-allowed text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>{t('contact.form.button.sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t('contact.form.button.send')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="bg-[#201b17] p-8 rounded-2xl shadow-2xl border border-stone-800 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-[#c9a36a]">{t("contact.additional.title")}</h3>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div>
                <h4 className="font-semibold mb-2">{t("contact.additional.expert.title")}</h4>
                <p className="text-stone-300 text-sm">{t("contact.additional.expert.text")}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t("contact.additional.personalized.title")}</h4>
                <p className="text-stone-300 text-sm">{t("contact.additional.personalized.text")}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t("contact.additional.quality.title")}</h4>
                <p className="text-stone-300 text-sm">{t("contact.additional.quality.text")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;