import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Camera, ImagePlus, Send, Trash2, UploadCloud } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { omanLocations, serviceCategories } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";
import { detectIssueFromPhoto } from "../utils/marketplace";

export default function RequestFormPage({ onSubmit }) {
  const [searchParams] = useSearchParams();
  const { isArabic, locationName, serviceName, statusName, t } = useLanguage();
  const selectedService = searchParams.get("service") || "AC maintenance";
  const [formData, setFormData] = useState({
    serviceType: selectedService,
    description: "",
    urgency: "Normal",
    location: "Muscat",
    preferredTime: "",
    photoName: "",
    photoPreview: "",
    photoSize: ""
  });
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const examples = useMemo(
    () => ({
      "Electrical repair": t("request.defaultDescription"),
      Plumbing: t("request.defaultDescription"),
      "AC maintenance": t("request.defaultDescription"),
      Cleaning: t("request.defaultDescription"),
      Painting: t("request.defaultDescription"),
      Carpentry: t("request.defaultDescription"),
      "Appliance repair": t("request.defaultDescription"),
      "Pest control": t("request.defaultDescription"),
      "Emergency repair": t("request.defaultDescription")
    }),
    [t]
  );

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function formatFileSize(size) {
    if (!size) return "";
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function selectPhoto(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        photoName: file.name,
        photoPreview: reader.result,
        photoSize: formatFileSize(file.size)
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(event) {
    selectPhoto(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDraggingPhoto(false);
    selectPhoto(event.dataTransfer.files?.[0]);
  }

  function clearPhoto() {
    setFormData((current) => ({ ...current, photoName: "", photoPreview: "", photoSize: "" }));
  }

  const aiDetection = formData.photoName ? detectIssueFromPhoto(formData.photoName, formData.serviceType) : null;
  const isEmergency = formData.urgency === "Emergency";
  const photoCopy = isArabic
    ? {
        title: "إضافة صورة للمشكلة",
        text: "اسحب الصورة هنا، أو اختر صورة من الملفات أو مكتبة الصور.",
        choose: "اختيار صورة",
        camera: "التقاط صورة",
        accepted: "الصيغ المقبولة: JPG و PNG و HEIC وأي صيغة صورة يدعمها جهازك.",
        selected: "تم اختيار صورة",
        remove: "إزالة الصورة المختارة",
        aiTitle: "تحليل الصورة",
        confidence: "نسبة الثقة",
        suggested: "الخدمة المقترحة"
      }
    : {
        title: "Add a problem photo",
        text: "Drag and drop an image here, or choose one from your files or photo library.",
        choose: "Choose image",
        camera: "Take photo",
        accepted: "Accepted formats: JPG, PNG, HEIC, and other image files supported by your device.",
        selected: "Image selected",
        remove: "Remove selected photo",
        aiTitle: "AI issue detection",
        confidence: "Confidence",
        suggested: "Suggested service"
      };
  const nextStepCopy = isArabic
    ? {
        kicker: "الخطوة التالية",
        title: "مطابقة المزودين",
        text: "بعد الإرسال سنرسل الطلب إلى المزودين المناسبين، ثم تظهر العروض عند توفرها."
      }
    : {
        kicker: "Next step",
        title: "Provider matching",
        text: "After submit, Baytak sends the request to suitable providers and shows offers when they respond."
      };

  function submitForm() {
    onSubmit({
      ...formData,
      description: formData.description || examples[formData.serviceType] || "Customer reported a maintenance issue.",
      preferredTime: formData.preferredTime || t("request.defaultTime"),
      photoName: formData.photoName || "photo-placeholder.jpg"
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitForm();
  }

  return (
    <div>
      <SectionHeader
        kicker={t("request.kicker")}
        title={t("request.title")}
        description={t("request.description")}
        action={
          <button type="submit" form="request-form" className="btn-primary">
            {t("request.submit")}
            <Send size={17} />
          </button>
        }
      />

      <form id="request-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={`glass-card rounded-[2.4rem] p-6 ${isEmergency ? "border-red-300 ring-4 ring-red-100" : ""}`}>
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-extrabold">
              {t("request.serviceType")}
              <select className="input-field" value={formData.serviceType} onChange={(event) => updateField("serviceType", event.target.value)}>
                {serviceCategories.map((service) => (
                  <option key={service.id} value={service.name}>{serviceName(service.name)}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-extrabold">
              {t("request.problem")}
              <textarea
                className="input-field min-h-36 resize-none"
                value={formData.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder={examples[formData.serviceType]}
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-extrabold">
              {t("request.urgency")}
                <select className="input-field" value={formData.urgency} onChange={(event) => updateField("urgency", event.target.value)}>
                  {["Normal", "Urgent", "Emergency"].map((urgency) => (
                    <option key={urgency} value={urgency}>{statusName(urgency)}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-extrabold">
                {t("request.locationOman")}
                <select className="input-field" value={formData.location} onChange={(event) => updateField("location", event.target.value)}>
                  {omanLocations.map((location) => (
                    <option key={location} value={location}>{locationName(location)}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-extrabold">
              {t("request.preferredTime")}
              <input
                className="input-field"
                value={formData.preferredTime}
                onChange={(event) => updateField("preferredTime", event.target.value)}
                placeholder={t("request.preferredPlaceholder")}
              />
            </label>
          </div>
          {isEmergency && (
            <div className="mt-5 rounded-[1.7rem] border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
              Emergency mode enabled: high-priority dispatch, faster provider response, and emergency fee included.
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="surface-card rounded-[2.4rem] border border-dashed border-lagoon/35 p-6 shadow-card">
            <div
              className={`rounded-[1.7rem] border-2 border-dashed p-4 text-center transition ${
                isDraggingPhoto ? "border-lagoon bg-lagoon/10" : "border-lagoon/30 bg-mist"
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingPhoto(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingPhoto(true);
              }}
              onDragLeave={() => setIsDraggingPhoto(false)}
              onDrop={handleDrop}
            >
              {formData.photoPreview ? (
                <div className="overflow-hidden rounded-[1.2rem] bg-white">
                  <img src={formData.photoPreview} alt={formData.photoName} className="h-56 w-full object-cover" />
                </div>
              ) : (
                <div className="grid min-h-48 place-items-center rounded-[1.2rem] bg-white/45 px-4 py-8 text-lagoon">
                  <div>
                    <UploadCloud size={42} className="mx-auto" />
                    <p className="mt-4 text-lg font-black text-ink">{photoCopy.title}</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-ink/55">
                      {photoCopy.text}
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus size={17} />
                  {photoCopy.choose}
                </button>
                <button type="button" className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>
                  <Camera size={17} />
                  {photoCopy.camera}
                </button>
              </div>
            </div>
            {formData.photoName ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] bg-mist p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-ink">{formData.photoName}</p>
                  <p className="mt-1 text-xs font-bold text-ink/50">{formData.photoSize || photoCopy.selected}</p>
                </div>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white text-red-600 shadow-sm" onClick={clearPhoto} aria-label={photoCopy.remove}>
                  <Trash2 size={17} />
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/55">{photoCopy.accepted}</p>
            )}
            {aiDetection && (
              <div className="surface-muted mt-4 rounded-[1.7rem] p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lagoon">{photoCopy.aiTitle}</p>
                <p className="mt-2 text-lg font-black text-ink">{aiDetection.issue}</p>
                <p className="mt-1 text-sm font-bold text-ink/60">
                  {photoCopy.confidence}: {aiDetection.confidence}% - {photoCopy.suggested}: {aiDetection.suggestedService}
                </p>
              </div>
            )}
          </div>

          <div className="premium-panel rounded-[2.4rem] p-6 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-palm">{nextStepCopy.kicker}</p>
            <h2 className="mt-3 font-display text-3xl font-bold">{nextStepCopy.title}</h2>
            <p className="mt-3 leading-7 text-white/65">{nextStepCopy.text}</p>
            <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5">
              {t("request.submit")}
              <Send size={17} />
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
