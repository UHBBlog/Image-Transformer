
import React, { useState, useRef } from 'react';
import { EditMode } from '../types';
import { SparklesIcon, PhotoIcon, PlusIcon, TrashIcon } from './icons';

interface EditorPanelProps {
  mode: EditMode;
  setMode: (mode: EditMode) => void;
  onGenerate: (prompt: string) => void;
  additionalImages: File[];
  onAdditionalImageUpload: (file: File) => void;
  onRemoveAdditionalImage: (index: number) => void;
  isLoading: boolean;
}

const AVATAR_PRESETS = [
    { name: "Digital Art", prompt: "Convert this photo into a digital avatar with a clean, modern art style. Preserve facial features, make it look friendly and vibrant. Use soft lighting and smooth color palette." },
    { name: "Cartoon", prompt: "Transform this photo into a 3D cartoon character avatar in the style of modern animation movies. Exaggerate features slightly for a fun, friendly look with vibrant colors and dynamic lighting." },
    { name: "Anime", prompt: "Reimagine this photo as a high-quality anime character. Give it large, expressive eyes, modern anime hair style, and a clean, sharp line art style. Cell shaded lighting." },
    { name: "Minimalist", prompt: "Create a minimalist line art avatar from this photo. Use simple, elegant lines to capture the essential facial features against a plain background. Black and white." },
    { name: "Sticker", prompt: "Create a cute 'chibi' style cartoon sticker from this photo. It should have a thick white border, simplified features, big expressive eyes, and bright, glossy colors. The character should look adorable and fun." },
    { name: "Fantasy Art", prompt: "Transform the person in this photo into a fantasy art character portrait. Give them elegant, slightly pointed ears like an elf, and simple, fantasy-style attire. The background should be a soft-focus magical forest with glowing particles. The lighting should be ethereal and soft." },
    { name: "Retro Comic", prompt: "Convert this photo into a retro comic book style portrait. Use bold black outlines, a limited color palette with flat colors, and a halftone dot pattern for shading (Ben-Day dots). The expression should be slightly dramatic, typical of classic comics." },
    { name: "Watercolor", prompt: "Recreate this photo as a beautiful watercolor painting. Use soft, blended colors with visible brush strokes and a textured paper background. The style should be artistic and expressive, capturing the likeness in a gentle, fluid manner." },
    { name: "Cinematic", prompt: "Transform this photo into a cinematic character portrait. Use dramatic lighting with deep shadows and strong highlights. Add a subtle film grain effect. The mood should be intense and moody." },
    { name: "Pixel Art", prompt: "Convert this photo into a 16-bit pixel art character sprite. Use a limited color palette and simplify the features into distinct pixel blocks. The result should look like a character from a classic retro video game." },
    { name: "Graffiti", prompt: "Reimagine the person in this photo as a vibrant piece of graffiti art. Use bold, spray-paint style outlines, vibrant, saturated colors, and stylized lettering elements in the background. The style should be urban and edgy." },
    { name: "Vaporwave", prompt: "Create a vaporwave aesthetic avatar from this photo. Use a palette of neon pinks, blues, and purples. Incorporate classic vaporwave motifs like Roman busts and grid patterns. Add a glitch effect and a nostalgic, retro-futuristic feel." },
    { name: "Steampunk", prompt: "Transform this person into a steampunk character. Incorporate victorian-era clothing, brass goggles, and subtle gear and cog motifs. The lighting should be warm, reminiscent of gas lamps, and the overall color palette should feature browns, brass, and copper tones." },
    { name: "Cyberpunk", prompt: "Create a cyberpunk avatar from this photo. Add futuristic cybernetic enhancements, neon highlights in the hair or on the clothing, and a gritty, rain-slicked city background with glowing holographic signs. The lighting should be high-contrast with vibrant neon colors." },
    { name: "Fairy Tale", prompt: "Reimagine this photo as a character from a classic fairy tale book illustration. Use a soft, whimsical art style with gentle colors and a dreamy, enchanted forest background. Add subtle magical elements like glowing fireflies or floral patterns." },
    { name: "Egyptian Hieroglyph", prompt: "Convert this photo into the style of an ancient Egyptian hieroglyph. The person should be in profile, with flat colors, bold outlines, and stylistic elements typical of Egyptian art. The background should be a textured papyrus or stone wall." },
    { name: "8-bit Pixel Art", prompt: "Convert this photo into an 8-bit pixel art portrait. Use a highly restricted color palette, like the NES, and simplify features into a very blocky, low-resolution form. The result should look like a character from a classic 80s video game." },
    { name: "Vintage Film", prompt: "Transform this photo into a vintage film style. Use a desaturated color palette with a slight sepia tone. Add subtle film grain and light leaks for an authentic retro feel. The overall mood should be nostalgic and artistic." },
];

const PROFESSIONAL_PRESETS = [
    { name: "Studio Look", prompt: "Edit this photo to look like a professional headshot. Create a soft, out-of-focus studio background (light gray). Adjust lighting to be flattering and professional, enhance sharpness, and perform a subtle skin retouch." },
    { name: "Face Smooth", prompt: "Perform a professional skin retouch on this portrait. Smooth the skin texture naturally, reduce minor blemishes and wrinkles, while preserving the natural facial features and character. Avoid making the skin look plastic or overly edited. Keep the overall look realistic and high-quality." },
    { name: "LinkedIn", prompt: "Enhance this photo for a LinkedIn profile. Adjust lighting for clarity, sharpen the details, and replace the background with a subtle, modern office setting. Ensure a professional and approachable look." },
    { name: "Outdoor", prompt: "Edit this photo to appear as if it was taken outdoors by a professional photographer. Apply natural, bright lighting (golden hour) and a softly blurred natural background (park or greenery)." },
    { name: "Dramatic", prompt: "Apply a dramatic, high-contrast black and white filter to this portrait. Emphasize shadows and highlights to create a powerful, artistic, and professional look." },
    { name: "Cinematic Headshot", prompt: "Re-light this portrait to give it a cinematic feel. Use moody, directional lighting to create depth and drama. Desaturate the colors slightly and add a subtle teal and orange color grade. The background should be dark and non-distracting." },
    { name: "Corporate Clean", prompt: "Adjust this photo for a modern corporate website. Use bright, even lighting. The background should be a clean, minimalist office interior, slightly blurred. The subject's expression should be confident and friendly. Ensure high sharpness and clarity." },
    { name: "Black & White Film", prompt: "Convert this photo to a classic black and white film portrait. Add a noticeable but fine film grain. Increase the contrast for deep blacks and bright whites, mimicking the look of Kodak Tri-X 400 film. The result should feel timeless and artistic." },
    { name: "Magazine Cover", prompt: "Edit this photo to look like a high-fashion magazine cover shot. Apply flawless skin retouching, enhance the eyes and facial features for a striking look. Use bold, high-contrast lighting. The background should be a solid, bold color." },
    { name: "Coffee Vibe", prompt: "Edit this photo to have a warm, cozy coffee shop vibe. Apply a warm color grade with rich brown and orange tones. The lighting should be soft and inviting, and the background should be subtly blurred to look like the interior of a trendy cafe." },
    { name: "Urban Style", prompt: "Give this photo a modern, urban style. Apply a cooler, slightly desaturated color grade with high contrast. The background should be a gritty, out-of-focus city scene with neon lights or graffiti. The overall look should be edgy and fashionable." },
    { name: "Professional Hijab", prompt: "Enhance this portrait for a professional context, ensuring the hijab is presented elegantly. Use soft, flattering studio lighting. The background should be a neutral, professional setting (like a modern office or a simple studio backdrop). Ensure the focus is on a confident and approachable expression." },
    { name: "Tech Startup", prompt: "Create a professional headshot suitable for a tech startup profile. Use clean, bright lighting. The background should be a modern, bright office space with elements like whiteboards or glass walls, slightly out of focus. The subject should look approachable and innovative." },
    { name: "Outdoor Corporate", prompt: "Create a corporate headshot with a natural, outdoor background. The background should be a modern building exterior or a clean urban park, softly blurred. Use bright, natural light that looks professional and confident. Avoid harsh shadows." },
];

const PRODUCT_PRESETS = [
    { name: "White Background", prompt: "Isolate the main product from the photo and place it on a clean, pure white background (#FFFFFF). The lighting should be bright and even, as if in a professional photo studio. Add a subtle, soft shadow underneath the product for realism." },
    { name: "Lifestyle Scene", prompt: "Place the product in a relevant and aesthetically pleasing lifestyle scene. For example, if it's a coffee mug, place it on a rustic wooden table next to a book. The product should be in sharp focus, with the background slightly blurred (bokeh effect)." },
    { name: "Transparent BG", prompt: "Carefully and precisely remove the background from the image, leaving only the main product with clean, sharp edges. Make the background transparent." },
    { name: "Studio Lighting", prompt: "Enhance the photo with professional studio lighting. Use a three-point lighting setup (key, fill, and back lights) to create depth and highlight the product's textures and details. The background should be a neutral dark gray." },
    { name: "Floating Effect", prompt: "Make the main product appear to be floating in mid-air against a simple, gradient background. Add a soft, diffused drop shadow directly beneath it to create a sense of depth and suspension. The lighting should be uniform and highlight the product's form." },
    { name: "Hero Shot", prompt: "Recreate this as a dramatic 'hero shot'. Place the product on a dark, reflective surface against a dark background. Use strong, cinematic lighting to highlight its key features and create a premium, eye-catching look." },
    { name: "In Hand", prompt: "Show the product being held by a well-manicured hand to demonstrate its scale and use. The background should be simple and out-of-focus to keep the attention on the product." },
    { name: "Natural Setting", prompt: "Place the product in a realistic natural setting, such as on a mossy rock in a forest or on clean sand at a beach. The lighting should be natural and match the environment." },
    { name: "Minimalist Scene", prompt: "Create a minimalist scene for the product. Place it on a simple geometric pedestal (like a cube or cylinder) against a solid, single-color background. The lighting should be soft and create subtle shadows." },
    { name: "Cinematic Shot", prompt: "Present this product with a cinematic flair. Place it on a dark, textured surface like slate or concrete. Use a single, dramatic spotlight from the side to create long shadows and highlight the product's form and texture. Add a subtle haze or smoke effect in the background." },
    { name: "Neon Glow", prompt: "Showcase the product on a dark surface, illuminated by vibrant neon lights. The light should cast colorful reflections on the product and the surface. The overall mood should be futuristic and energetic, like a scene from a cyberpunk city." },
    { name: "Mie Ayam", prompt: "Recreate this photo of mie ayam (chicken noodles) into a professional food photography shot. The noodles should look glossy and perfectly cooked. The chicken topping should be glistening and plentiful. Add common accompaniments like steamed bok choy, meatballs (bakso), and a crispy wonton (pangsit goreng). Place it in a stylish ceramic bowl on a clean, slightly rustic wooden table. The lighting should be bright and natural, highlighting the textures of the food, making it look incredibly delicious and appetizing." },
];

const COMBINE_PRESETS = [
    { name: "Organic Blend", prompt: "Seamlessly blend all provided images together into a single, cohesive, and photorealistic composition. Ensure lighting and perspective are consistent." },
    { name: "Subject Placement", prompt: "Take the subject from the first image and place them realistically into the environment depicted in the second image. Adjust lighting and shadows to match." },
    { name: "Style Transfer", prompt: "Reimagine the content of the first image using the artistic style and color palette of the second image." },
    { name: "Double Exposure", prompt: "Create an artistic double exposure effect merging the silhouettes and textures of the provided images." },
    { name: "Fantasy Fusion", prompt: "Merge the elements of these images into a surreal, fantasy-inspired composition." },
    { name: "Character Integration", prompt: "Integrate the character from the first image into the scene provided in the second image. Ensure a seamless realistic match." },
    { name: "Creative Collage", prompt: "Create an artistic collage combining elements from all provided images in a visually striking way." }
];


export const EditorPanel: React.FC<EditorPanelProps> = ({ 
    mode, 
    setMode, 
    onGenerate,
    additionalImages,
    onAdditionalImageUpload,
    onRemoveAdditionalImage,
    isLoading 
}) => {
    const [customPrompt, setCustomPrompt] = useState('');
    const [customBgPrompt, setCustomBgPrompt] = useState('');
    const additionalInputRef = useRef<HTMLInputElement>(null);

    const presets = mode === 'avatar' 
        ? AVATAR_PRESETS 
        : mode === 'professional' 
        ? PROFESSIONAL_PRESETS 
        : mode === 'product'
        ? PRODUCT_PRESETS
        : COMBINE_PRESETS;

    const handleGenerateClick = (basePrompt: string) => {
        onGenerate(basePrompt);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach((file: File) => {
                if (file.type.startsWith('image/')) {
                    onAdditionalImageUpload(file);
                }
            });
        }
        if(e.target) e.target.value = '';
    };

    const handleGenerateBgClick = () => {
        const bgPrompt = `Keep the subject in the foreground exactly as they are, but replace the entire background with: "${customBgPrompt}". Make the lighting on the subject match the new background for a realistic composite.`;
        onGenerate(bgPrompt);
    }

    const handleCombineProductPrompt = () => {
         const prompt = customPrompt.trim() 
            ? `Using the first image as the primary product and the additional images as the model or scene, combine them based on the following instruction: "${customPrompt}". Ensure the final image is photorealistic and well-composited.`
            : "Using the first image as the primary product and the second image as the model or scene, combine them realistically. Ensure the final image is photorealistic and well-composited.";
        onGenerate(prompt);
    }
    
    return (
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col gap-6">
            <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-300">2. Choose Mode</h2>
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => setMode('avatar')} className={`px-2 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 transform ${mode === 'avatar' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'}`}>Avatar</button>
                    <button onClick={() => setMode('professional')} className={`px-2 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 transform ${mode === 'professional' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'}`}>Pro</button>
                    <button onClick={() => setMode('product')} className={`px-2 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 transform ${mode === 'product' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'}`}>Product</button>
                    <button onClick={() => setMode('combine')} className={`px-2 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 transform ${mode === 'combine' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'}`}>Combine</button>
                </div>
            </div>

            <div>
                 <h2 className="text-lg font-semibold mb-4 text-gray-300">3. Select a Style</h2>
                 <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {presets.map(preset => (
                        <button 
                            key={preset.name} 
                            onClick={() => handleGenerateClick(preset.prompt)}
                            disabled={isLoading}
                            className="p-3 text-sm text-left bg-gray-700 rounded-md hover:bg-gray-600 transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {preset.name}
                        </button>
                    ))}
                 </div>
            </div>

            {(mode === 'combine' || mode === 'product') && (
                <div className="border-t border-gray-700 pt-6 animate-fade-in">
                    <h2 className="text-lg font-semibold mb-4 text-gray-300">
                        {mode === 'product' ? 'Reference Image (Model/Scene)' : 'Additional Images'}
                        <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                    </h2>
                    <input
                        type="file"
                        ref={additionalInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        multiple={mode === 'combine'}
                    />
                    
                     <div className="flex flex-col gap-3">
                         {/* Upload Button */}
                         {(mode === 'combine' || additionalImages.length === 0) && (
                            <button
                                onClick={() => additionalInputRef.current?.click()}
                                disabled={isLoading}
                                className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-8 h-8 text-gray-500 mb-2" />
                                <span className="text-sm font-medium text-gray-400">
                                    {mode === 'product' ? 'Upload Model/Scene' : 'Add Image'}
                                </span>
                            </button>
                         )}

                         {/* Image List */}
                         {additionalImages.length > 0 && (
                             <div className="flex flex-col gap-2">
                                {additionalImages.map((file, index) => (
                                     <div key={index} className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                                        <img 
                                            src={URL.createObjectURL(file)} 
                                            alt={`Reference ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded-md"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-medium text-gray-300 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            onClick={() => onRemoveAdditionalImage(index)}
                                            disabled={isLoading}
                                            className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                                            aria-label="Remove image"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                             </div>
                         )}
                     </div>
                </div>
            )}

            {(mode === 'professional') && (
                <div className="border-t border-gray-700 pt-6">
                     <h2 className="text-lg font-semibold mb-4 text-gray-300">Generate Custom Background</h2>
                     <textarea 
                        value={customBgPrompt}
                        onChange={(e) => setCustomBgPrompt(e.target.value)}
                        placeholder="e.g., a serene beach at sunset"
                        rows={2}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        disabled={isLoading}
                     />
                     <button 
                        onClick={handleGenerateBgClick} 
                        disabled={isLoading || !customBgPrompt.trim()}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <PhotoIcon className="w-5 h-5" />
                                Generate Background
                            </>
                        )}
                    </button>
                </div>
            )}


            <div className="border-t border-gray-700 pt-6">
                 <h2 className="text-lg font-semibold mb-4 text-gray-300">Or Write a Custom Prompt</h2>
                 <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={mode === 'combine' ? "e.g., blend these images together in a surreal style" : "e.g., Add a retro filter and a leather jacket"}
                    rows={3}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    disabled={isLoading}
                 />
                 <button 
                    onClick={() => handleGenerateClick(customPrompt)} 
                    disabled={isLoading || !customPrompt.trim()}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-wait"
                 >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate with Custom Prompt
                        </>
                    )}
                </button>

                 {mode === 'product' && additionalImages.length > 0 && (
                    <button 
                        onClick={handleCombineProductPrompt} 
                        disabled={isLoading}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-teal-600 hover:to-green-600 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Combining...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Combine Product & Model
                            </>
                        )}
                    </button>
                )}
            </div>

        </div>
    )
}
