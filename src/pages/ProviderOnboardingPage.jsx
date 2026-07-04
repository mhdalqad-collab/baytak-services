import { useState } from "react";
import { FileCheck2, Send } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { omanLocations } from "../data/mockData";

export default function ProviderOnboardingPage({ onSubmit, categories }) {
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    phone: "",
    type: "Company",
    baseLocation: "Muscat",
    priceLevel: "Balanced",
    specialties: ["AC maintenance"],
    documents: "Commercial registration, technician IDs, insurance"
  });

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function toggleSpecialty(category) {
    setFormData((current) => {
      const exists = current.specialties.includes(category);
      return {
        ...current,
        specialties: exists
          ? current.specialties.filter((item) => item !== category)
          : [...current.specialties, category]
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...formData,
      name: formData.name || "New Maintenance Provider",
      contactName: formData.contactName || "Operations Manager",
      phone: formData.phone || "+968 9000 0000"
    });
  }

  return (
    <div>
      <SectionHeader
        kicker="Provider onboarding"
        title="Collect, verify, and approve new service partners"
        description="This workflow captures provider identity, service coverage, pricing position, and compliance documents before admin approval."
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <article className="glass-card rounded-[2.4rem] p-6">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-extrabold">
              Business name
              <input className="input-field" value={formData.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Example: Muscat Home Experts" />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-extrabold">
                Contact person
                <input className="input-field" value={formData.contactName} onChange={(event) => updateField("contactName", event.target.value)} placeholder="Operations manager" />
              </label>
              <label className="grid gap-2 text-sm font-extrabold">
                Phone
                <input className="input-field" value={formData.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+968 ..." />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-extrabold">
                Provider type
                <select className="input-field" value={formData.type} onChange={(event) => updateField("type", event.target.value)}>
                  <option>Company</option>
                  <option>Technician</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-extrabold">
                Main location
                <select className="input-field" value={formData.baseLocation} onChange={(event) => updateField("baseLocation", event.target.value)}>
                  {omanLocations.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-extrabold">
                Price level
                <select className="input-field" value={formData.priceLevel} onChange={(event) => updateField("priceLevel", event.target.value)}>
                  <option>Value</option>
                  <option>Balanced</option>
                  <option>Premium</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-extrabold">
              Compliance documents
              <textarea className="input-field min-h-28 resize-none" value={formData.documents} onChange={(event) => updateField("documents", event.target.value)} />
            </label>
          </div>
        </article>

        <aside className="space-y-5">
          <article className="surface-card rounded-[2.4rem] p-6 shadow-card">
            <div className="mb-5 flex items-center gap-3">
              <FileCheck2 className="text-lagoon" />
              <h2 className="font-display text-3xl font-bold">Service coverage</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={`rounded-full px-3 py-2 text-xs font-extrabold transition ${
                    formData.specialties.includes(category) ? "bg-lagoon text-white" : "theme-chip"
                  }`}
                  onClick={() => toggleSpecialty(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </article>

          <button className="btn-primary w-full">
            Submit for approval
            <Send size={17} />
          </button>
        </aside>
      </form>
    </div>
  );
}
