"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ChevronRight, ChevronLeft, Search, Check, Loader2,
  AlertCircle, Laptop, Monitor, Cpu, Layers,
  Wifi, Activity, Camera, Trash, ShieldCheck
} from "lucide-react";
import {
  signExchangeUploadAction,
  type SubmitExchangeInput,
} from "@/app/actions/exchange";
import { cn } from "@/lib/utils";

// Step types and configurations
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface ExchangeWizardProps {
  productId?: string | null;
  productName?: string;
  /** Prefilled from the session so signed-in customers do not retype. */
  defaultContact?: { name?: string; email?: string; phone?: string };
  /** Drives the submit button's loading state; also blocks double submission. */
  submitting?: boolean;
  onComplete: (data: SubmitExchangeInput) => void;
  onClose: () => void;
}

const DEVICE_TYPES = [
  { id: "Laptop", label: "Laptop", icon: Laptop },
  { id: "Desktop", label: "Desktop", icon: Laptop }, // Fallback to Laptop for desktop look
  { id: "Server", label: "Server", icon: Layers },
  { id: "Networking", label: "Networking", icon: Wifi },
  { id: "Workstation", label: "Workstation", icon: Cpu },
  { id: "Monitor", label: "Monitor", icon: Monitor },
  { id: "Accessories", label: "Accessories", icon: Activity },
];

const BRANDS = ["Dell", "HP", "Lenovo", "Apple", "Cisco", "IBM", "Fujitsu", "Acer", "ASUS", "MSI", "Other"];

const MAX_IMAGES = 10;
/** Pre-compression ceiling. Anything larger is almost certainly a mistake. */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/** What the review team needs to see to price a device accurately. */
const PHOTO_GUIDE = [
  "Front", "Back", "Screen (powered on)", "Keyboard",
  "Ports", "Serial / service tag", "Any damage", "Accessories",
];

const PICKUP_OPTIONS = [
  { id: "Pickup", label: "Free courier pickup", desc: "We collect the device from your address." },
  { id: "Drop-off", label: "Drop-off", desc: "You drop it at a parcel point or our facility." },
  { id: "Courier", label: "Prepaid shipping label", desc: "We email a label; you post the device." },
] as const;

type PickupOption = (typeof PICKUP_OPTIONS)[number]["id"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 16px text avoids iOS Safari's zoom-on-focus; min-h keeps the tap target big. */
const INPUT_CLASS =
  "w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20";

function Field({
  id, label, required, className, children,
}: {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500" aria-hidden>*</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-200/70 py-1 last:border-0">
      <dt className="shrink-0 font-medium text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate text-right font-bold text-slate-800">{value}</dd>
    </div>
  );
}

const POPULAR_MODELS: Record<string, string[]> = {
  Laptop: ["Latitude 7420", "EliteBook 840 G8", "ThinkPad T14", "MacBook Pro 14\"", "MacBook Air M2", "ThinkPad X1 Carbon"],
  Desktop: ["OptiPlex 7080", "ProDesk 600 G6", "ThinkCentre M70q", "iMac 27\" 5K"],
  Server: ["PowerEdge R740", "ProLiant DL360 Gen10", "ThinkSystem SR650"],
  Networking: ["Catalyst 9300", "ISR 4331", "SG350-28"],
  Workstation: ["Precision 5820", "Z4 G4", "ThinkStation P340"],
  Monitor: ["UltraSharp U2720Q", "EliteDisplay E243", "ThinkVision T24i"],
  Accessories: ["Thunderbolt Dock WD19TB", "ThinkPad USB-C Dock Gen 2", "HP USB-C Dock G5"],
};

export function ExchangeWizard({
  productId = null,
  productName,
  defaultContact,
  submitting = false,
  onComplete,
  onClose,
}: ExchangeWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const fieldId = useId();

  // Wizard State
  const [deviceType, setDeviceType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [isCustomModelActive, setIsCustomModelActive] = useState(false);
  const [searchModelQuery, setSearchModelQuery] = useState("");

  // Step 4 specs
  const [ram, setRam] = useState("16GB");
  const [storage, setStorage] = useState("512GB SSD");
  const [cpu, setCpu] = useState("Intel Core i7");
  const [gpu, setGpu] = useState("");
  const [generation, setGeneration] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [serviceTag, setServiceTag] = useState("");
  const [purchaseYear, setPurchaseYear] = useState<number>(new Date().getFullYear());

  // Step 5 Condition
  const [condition, setCondition] = useState("Good");

  // Step 6 Checklist
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    screenWorking: true,
    batteryWorking: true,
    keyboardWorking: true,
    charging: true,
    portsWorking: true,
    wifi: true,
    camera: true,
    display: true,
    motherboard: true,
    powerAdapterIncluded: true,
    originalBox: false,
    accessoriesIncluded: false,
  });

  // Step 7 Images
  const [images, setImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [imageError, setImageError] = useState("");

  // Step 8 Description
  const [description, setDescription] = useState("");

  // Step 9 Contact & collection. Rhydm's team reviews every request by hand,
  // so these are what actually make a submission actionable.
  const [contactName, setContactName] = useState(defaultContact?.name ?? "");
  const [contactEmail, setContactEmail] = useState(defaultContact?.email ?? "");
  const [contactPhone, setContactPhone] = useState(defaultContact?.phone ?? "");
  const [pickupOption, setPickupOption] = useState<PickupOption>("Pickup");
  const [pickupAddress, setPickupAddress] = useState("");
  const [contactError, setContactError] = useState("");

  // Load Model Options dynamically
  const modelOptions = deviceType ? POPULAR_MODELS[deviceType] || [] : [];
  const filteredModels = modelOptions.filter((m) =>
    m.toLowerCase().includes(searchModelQuery.toLowerCase())
  );

  // Functional Checklist items labels
  const checklistItems = [
    { id: "screenWorking", label: "Screen Working & Scratch Free" },
    { id: "batteryWorking", label: "Battery Working & Holds Charge" },
    { id: "keyboardWorking", label: "Keyboard & Trackpad Fully Functional" },
    { id: "charging", label: "Device Powering Up & Charging" },
    { id: "portsWorking", label: "All Ports Fully Functional" },
    { id: "wifi", label: "WiFi & Bluetooth Working" },
    { id: "camera", label: "Webcam & Speakers Working" },
    { id: "display", label: "Display Color & Pixels Working" },
    { id: "motherboard", label: "Motherboard / Board Tested OK" },
    { id: "powerAdapterIncluded", label: "Power Adapter Included" },
    { id: "originalBox", label: "Original Retail Box Included" },
    { id: "accessoriesIncluded", label: "Other Original Accessories Included" },
  ];

  // Image direct compression & Cloudinary upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    // Reset immediately so re-picking the same file still fires onChange.
    input.value = "";
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      setImageError(`You can upload up to ${MAX_IMAGES} photos.`);
      return;
    }

    const rejected = files.find(
      (f) => !f.type.startsWith("image/") || f.size > MAX_IMAGE_BYTES,
    );
    if (rejected) {
      setImageError(
        rejected.type.startsWith("image/")
          ? `"${rejected.name}" is larger than 15 MB. Please choose a smaller photo.`
          : `"${rejected.name}" is not an image file.`,
      );
      return;
    }

    setUploadingImage(true);
    setUploadProgress({ done: 0, total: files.length });
    setImageError("");

    try {
      const signRes = await signExchangeUploadAction();
      if ("error" in signRes) throw new Error(signRes.error);

      const uploadInfo = signRes.upload;
      if (!uploadInfo) throw new Error("Could not start the upload. Please try again.");

      for (const [index, file] of files.entries()) {
        const compressedBlob = await compressImage(file);

        const formData = new FormData();
        formData.append("file", compressedBlob, file.name);
        formData.append("api_key", uploadInfo.apiKey);
        formData.append("timestamp", String(uploadInfo.timestamp));
        formData.append("folder", uploadInfo.folder);
        formData.append("signature", uploadInfo.signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${uploadInfo.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!res.ok) throw new Error("Upload failed. Please check your connection and try again.");

        const json = await res.json();
        setImages((prev) => [...prev, json.secure_url]);
        setImagePreviews((prev) => [...prev, json.secure_url]);
        setUploadProgress({ done: index + 1, total: files.length });
      }
    } catch (err: any) {
      setImageError(err?.message || "Failed to upload photo. Please try again.");
    } finally {
      setUploadingImage(false);
      setUploadProgress(null);
    }
  };

  // HTML Canvas client-side image compression helper
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if width > 1200
          if (width > 1200) {
            height = Math.round((1200 / width) * height);
            width = 1200;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            "image/jpeg",
            0.75 // 75% quality
          );
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1 && !deviceType) return;
    if (step === 2 && !brand) return;
    if (step === 3 && !model && !isCustomModelActive) return;
    if (step === 3 && isCustomModelActive && !customModel) return;
    if (step === 7 && images.length === 0) {
      setImageError("Please add at least one photo of your device.");
      return;
    }
    setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    setStep((s) => (s - 1) as Step);
  };

  /** Returns the first problem with the contact step, or null when it is valid. */
  const contactProblem = () => {
    if (contactName.trim().length < 2) return "Please enter your full name.";
    if (!EMAIL_PATTERN.test(contactEmail.trim())) return "Please enter a valid email address.";
    if (contactPhone.trim().length < 5) return "Please enter a phone number we can reach you on.";
    if (pickupOption === "Pickup" && pickupAddress.trim().length < 8) {
      return "Please enter the address we should collect the device from.";
    }
    return null;
  };

  const handleComplete = () => {
    if (submitting) return; // guards against a double tap on slow connections
    const problem = contactProblem();
    if (problem) {
      setContactError(problem);
      return;
    }
    setContactError("");

    onComplete({
      productId,
      deviceType,
      brand,
      model: isCustomModelActive ? customModel : model,
      customModel: isCustomModelActive,
      configRam: ram,
      configStorage: storage,
      configCpu: cpu,
      configGpu: gpu || null,
      configGeneration: generation || null,
      serialNumber: serialNumber || null,
      serviceTag: serviceTag || null,
      purchaseYear: Number(purchaseYear),
      condition,
      checklist,
      images,
      description: description || null,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      pickupOption,
      pickupAddress: pickupAddress.trim() || null,
    });
  };

  const progressPercent = (step / 9) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 md:p-6 lg:p-10">
      <div className="relative w-full max-w-4xl h-full sm:h-[90vh] bg-white rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-100">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 id="exchange-wizard-title" className="text-sm sm:text-lg font-bold text-slate-900">
              Trade-in request
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Tell us about your device — our team replies with an offer
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trade-in request"
            className="grid size-10 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar & Responsive Step Pills */}
        <div className="w-full bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="w-full h-1 bg-slate-100">
            <div
              className="h-full bg-[#16A34A] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 text-[10px] font-bold text-slate-400 no-scrollbar">
            {["Type", "Brand", "Model", "Specs", "Condition", "Checklist", "Photos", "Notes", "Contact"].map((label, idx) => (
              <span
                key={label}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 transition-colors",
                  step === idx + 1
                    ? "bg-[#16A34A] text-white"
                    : step > idx + 1
                    ? "bg-slate-200 text-slate-700"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {idx + 1}. {label}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Body / Active Step Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {/* STEP 1: DEVICE TYPE */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900">What type of device are you trading in?</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {DEVICE_TYPES.map((dt) => {
                      const Icon = dt.icon;
                      const isSelected = deviceType === dt.id;
                      return (
                        <button
                          key={dt.id}
                          type="button"
                          onClick={() => {
                            setDeviceType(dt.id);
                            // Clear model selections since type changed
                            setModel("");
                            setCustomModel("");
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border text-center transition-all cursor-pointer",
                            isSelected
                              ? "border-[#16A34A] bg-emerald-50/70 text-[#16A34A] ring-2 ring-[#16A34A]/25"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <Icon className="h-8 w-8" />
                          <span className="text-sm font-bold">{dt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT BRAND */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900">Select the brand of your device</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {BRANDS.map((br) => {
                      const isSelected = brand === br;
                      return (
                        <button
                          key={br}
                          type="button"
                          onClick={() => setBrand(br)}
                          className={cn(
                            "py-4 px-5 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer",
                            isSelected
                              ? "border-[#16A34A] bg-emerald-50/70 text-[#16A34A] ring-2 ring-[#16A34A]/25"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          {br}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT MODEL */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900">Select your device model</h3>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsCustomModelActive(false)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all",
                        !isCustomModelActive
                          ? "border-[#16A34A] bg-emerald-50/70 text-[#16A34A] ring-2 ring-[#16A34A]/20"
                          : "border-slate-200 bg-white text-slate-600"
                      )}
                    >
                      Search Popular Models
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomModelActive(true)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all",
                        isCustomModelActive
                          ? "border-[#16A34A] bg-emerald-50/70 text-[#16A34A] ring-2 ring-[#16A34A]/20"
                          : "border-slate-200 bg-white text-slate-600"
                      )}
                    >
                      Enter Custom Model
                    </button>
                  </div>

                  {!isCustomModelActive ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search models..."
                          value={searchModelQuery}
                          onChange={(e) => setSearchModelQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto pr-1">
                        {filteredModels.map((m) => {
                          const isSelected = model === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setModel(m)}
                              className={cn(
                                "py-3 px-4 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer",
                                isSelected
                                  ? "border-[#16A34A] bg-emerald-50/70 text-[#16A34A] ring-2 ring-[#16A34A]/20"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                              )}
                            >
                              {m}
                            </button>
                          );
                        })}
                        {filteredModels.length === 0 && (
                          <p className="col-span-2 text-center py-6 text-sm text-slate-400 font-medium">
                            No matching models found. Try custom model entry.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Model Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Latitude 7490"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#16A34A]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: CONFIGURATION */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900">Specify Hardware Configuration</h3>
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">RAM Capacity</label>
                      <select
                        value={ram}
                        onChange={(e) => setRam(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16A34A]"
                      >
                        <option value="4GB">4 GB</option>
                        <option value="8GB">8 GB</option>
                        <option value="16GB">16 GB</option>
                        <option value="32GB">32 GB</option>
                        <option value="64GB">64 GB</option>
                        <option value="128GB">128 GB+</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Storage Capacity</label>
                      <select
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16A34A]"
                      >
                        <option value="128GB SSD">128 GB SSD</option>
                        <option value="256GB SSD">256 GB SSD</option>
                        <option value="512GB SSD">512 GB SSD</option>
                        <option value="1TB SSD">1 TB SSD</option>
                        <option value="2TB SSD">2 TB SSD+</option>
                        <option value="500GB HDD">500 GB HDD</option>
                        <option value="1TB HDD">1 TB HDD</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">CPU Model / Class</label>
                      <select
                        value={cpu}
                        onChange={(e) => setCpu(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16A34A]"
                      >
                        <option value="Intel Core i3">Intel Core i3 (Low)</option>
                        <option value="Intel Core i5">Intel Core i5 (Medium)</option>
                        <option value="Intel Core i7">Intel Core i7 (High)</option>
                        <option value="Intel Core i9">Intel Core i9 (Performance)</option>
                        <option value="Intel Xeon">Intel Xeon (Server/WS)</option>
                        <option value="AMD Ryzen 3">AMD Ryzen 3</option>
                        <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                        <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                        <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                        <option value="Apple M1/M2/M3 Base">Apple M-Series Base (M1/M2/M3)</option>
                        <option value="Apple M1/M2/M3 Pro/Max">Apple M-Series Pro/Max</option>
                        <option value="Other">Other / Not Listed</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">GPU specs (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. GTX 1650, Integrated"
                        value={gpu}
                        onChange={(e) => setGpu(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16A34A]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Serial Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. CN-0XYZ123..."
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16A34A]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor={`${fieldId}-tag`} className="text-xs font-bold text-slate-700 uppercase">Service Tag (Optional)</label>
                      <input
                        id={`${fieldId}-tag`}
                        type="text"
                        placeholder="Dell/HP asset tag"
                        value={serviceTag}
                        onChange={(e) => setServiceTag(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor={`${fieldId}-year`} className="text-xs font-bold text-slate-700 uppercase">Purchase Year</label>
                      <input
                        id={`${fieldId}-year`}
                        type="number"
                        inputMode="numeric"
                        min={1990}
                        max={new Date().getFullYear()}
                        value={purchaseYear}
                        onChange={(e) => setPurchaseYear(Number(e.target.value))}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: CONDITION */}
              {step === 5 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900">What is the condition of your device?</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: "Excellent", title: "Excellent", desc: "No visible scratches, dents, or screen blemishes. Works flawlessly like new." },
                      { id: "Good", title: "Good", desc: "Minor signs of use (very light scratches on body). Screen is perfect. Fully functional." },
                      { id: "Fair", title: "Fair", desc: "Moderate scratches or small scuffs. Fully working but shows obvious cosmetic usage." },
                      { id: "Damaged", title: "Damaged", desc: "Deep scratches, dents, screen cracks, or minor defects. Still powers on and is usable." },
                      { id: "Non Working", title: "Non Working / Broken", desc: "Does not turn on, has dead parts, motherboard issues, or heavy battery damage." },
                    ].map((cond) => {
                      const isSelected = condition === cond.id;
                      return (
                        <button
                          key={cond.id}
                          type="button"
                          onClick={() => setCondition(cond.id)}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer",
                            isSelected
                              ? "border-[#16A34A] bg-emerald-50/70 ring-2 ring-[#16A34A]/25"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <div className={cn(
                            "size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                            isSelected ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-slate-300"
                          )}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-slate-900">{cond.title}</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cond.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: CHECKLIST */}
              {step === 6 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900">Functional Checklist</h3>
                  <p className="text-xs text-slate-500 font-medium">Verify which components and features are working correctly.</p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[35vh] overflow-y-auto pr-1">
                    {checklistItems.map((chk) => {
                      const checked = checklist[chk.id];
                      return (
                        <button
                          key={chk.id}
                          type="button"
                          onClick={() => setChecklist({ ...checklist, [chk.id]: !checked })}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                            checked
                              ? "border-[#16A34A]/40 bg-emerald-50/30 text-slate-800"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          )}
                        >
                          <div className={cn(
                            "size-4.5 rounded-md border flex items-center justify-center shrink-0",
                            checked ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-slate-300 bg-white"
                          )}>
                            {checked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-bold">{chk.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 7: UPLOAD IMAGES */}
              {step === 7 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Photos of your device</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Clear photos are what let our team price accurately. At least one is
                      required, up to {MAX_IMAGES}. On a phone you can shoot straight from the camera.
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {PHOTO_GUIDE.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {/* Upload tile */}
                    {imagePreviews.length < MAX_IMAGES && (
                      <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-2 text-center transition-colors hover:border-[#16A34A] hover:bg-slate-50 focus-within:border-[#16A34A] focus-within:ring-2 focus-within:ring-[#16A34A]/20">
                        {uploadingImage ? (
                          <>
                            <Loader2 className="h-7 w-7 animate-spin text-[#16A34A]" />
                            <span className="text-[11px] font-bold text-slate-500">
                              {uploadProgress
                                ? `Uploading ${uploadProgress.done + 1} of ${uploadProgress.total}…`
                                : "Uploading…"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Camera className="h-7 w-7 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500">Add photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="sr-only"
                        />
                      </label>
                    )}

                    {/* Previews */}
                    {imagePreviews.map((url, index) => (
                      <div key={url} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs">
                        {/* Cloudinary previews are already compressed and are
                            never rendered above ~200px, so a plain img avoids a
                            round trip through the optimizer for throwaway UI. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Device photo ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove photo ${index + 1}`}
                          className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-red-500/95 text-white shadow-md transition-colors hover:bg-red-600 cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <p aria-live="polite" className="sr-only">
                    {images.length} of {MAX_IMAGES} photos added.
                  </p>

                  {imageError && (
                    <p role="alert" className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{imageError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* STEP 8: DESCRIBE ISSUES */}
              {step === 8 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900">Are there any issues or notes we should know?</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Details (Optional)</label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please specify any defects, scratches, battery issues, missing buttons, or repair history..."
                      className="w-full resize-none border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 9: CONTACT & COLLECTION */}
              {step === 9 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      How should we reach you?
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                      Our team reviews your device details and photos by hand, then contacts
                      you with an offer. No automatic quote is generated.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id={`${fieldId}-name`} label="Full name" required className="sm:col-span-2">
                      <input
                        id={`${fieldId}-name`}
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        autoComplete="name"
                        placeholder="Jane Schmidt"
                        className={INPUT_CLASS}
                      />
                    </Field>

                    <Field id={`${fieldId}-email`} label="Email" required>
                      <input
                        id={`${fieldId}-email`}
                        type="email"
                        inputMode="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="jane@company.de"
                        className={INPUT_CLASS}
                      />
                    </Field>

                    <Field id={`${fieldId}-phone`} label="Phone" required>
                      <input
                        id={`${fieldId}-phone`}
                        type="tel"
                        inputMode="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        autoComplete="tel"
                        placeholder="+49 30 1234567"
                        className={INPUT_CLASS}
                      />
                    </Field>
                  </div>

                  <fieldset className="space-y-3">
                    <legend className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      How would you like to send the device?
                    </legend>
                    <div className="grid grid-cols-1 gap-3">
                      {PICKUP_OPTIONS.map((opt) => {
                        const isSelected = pickupOption === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setPickupOption(opt.id)}
                            className={cn(
                              "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                              isSelected
                                ? "border-[#16A34A] bg-emerald-50/70 ring-2 ring-[#16A34A]/25"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <span className={cn(
                              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                              isSelected ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-slate-300"
                            )}>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-extrabold text-slate-900">{opt.label}</span>
                              <span className="block text-xs text-slate-500 mt-0.5">{opt.desc}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {pickupOption === "Pickup" && (
                    <Field id={`${fieldId}-address`} label="Collection address" required>
                      <textarea
                        id={`${fieldId}-address`}
                        rows={3}
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        autoComplete="street-address"
                        placeholder="Street and number, postcode, city"
                        className={cn(INPUT_CLASS, "resize-none")}
                      />
                    </Field>
                  )}

                  {/* What is being sent for review */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Summary
                    </h4>
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
                      <SummaryRow label="Device" value={`${brand} ${isCustomModelActive ? customModel : model}`} />
                      <SummaryRow label="Type" value={deviceType} />
                      <SummaryRow label="Configuration" value={`${ram} · ${storage} · ${cpu}`} />
                      <SummaryRow label="Condition" value={condition} />
                      <SummaryRow label="Purchase year" value={String(purchaseYear)} />
                      <SummaryRow label="Photos" value={`${images.length} uploaded`} />
                      {productName && <SummaryRow label="Interested in" value={productName} />}
                    </dl>
                  </div>

                  <p className="flex items-start gap-2 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-[11px] font-medium leading-relaxed text-slate-500">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                    <span>
                      Your details are used only to assess this trade-in and contact you about
                      it. Every device we receive is data-wiped and certified.
                    </span>
                  </p>

                  {contactError && (
                    <p role="alert" className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{contactError}</span>
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-8 py-3.5 sm:py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || uploadingImage}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {step < 9 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                uploadingImage ||
                (step === 1 && !deviceType) ||
                (step === 2 && !brand) ||
                (step === 3 && !model && !isCustomModelActive) ||
                (step === 3 && isCustomModelActive && !customModel)
              }
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={submitting || uploadingImage}
              aria-busy={submitting}
              // Fixed min-width so swapping the label for the spinner does not
              // resize the footer mid-submit.
              className="flex min-h-11 min-w-[11rem] items-center justify-center gap-1.5 rounded-xl bg-[#16A34A] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#16A34A]/25 transition-colors hover:bg-[#159342] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <Check className="h-4.5 w-4.5 shrink-0 stroke-[2.5]" />
                  <span>Submit request</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
