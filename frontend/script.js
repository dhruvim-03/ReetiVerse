// ============================================
// WIKIMEDIA COMMONS + WIKIPEDIA INTEGRATION
// ============================================
const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1';
const WIKIPEDIA_SEARCH_BASE = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

const stateWikiMapping = {
    "Andhra Pradesh": "Andhra_Pradesh",
    "Arunachal Pradesh": "Arunachal_Pradesh",
    "Assam": "Assam",
    "Bihar": "Bihar",
    "Chhattisgarh": "Chhattisgarh",
    "Goa": "Goa",
    "Gujarat": "Gujarat",
    "Haryana": "Haryana",
    "Himachal Pradesh": "Himachal_Pradesh",
    "Jharkhand": "Jharkhand",
    "Karnataka": "Karnataka",
    "Kerala": "Kerala",
    "Madhya Pradesh": "Madhya_Pradesh",
    "Maharashtra": "Maharashtra",
    "Manipur": "Manipur",
    "Meghalaya": "Meghalaya",
    "Mizoram": "Mizoram",
    "Nagaland": "Nagaland",
    "Odisha": "Odisha",
    "Punjab": "Punjab",
    "Rajasthan": "Rajasthan",
    "Sikkim": "Sikkim",
    "Tamil Nadu": "Tamil_Nadu",
    "Telangana": "Telangana",
    "Tripura": "Tripura",
    "Uttar Pradesh": "Uttar_Pradesh",
    "Uttarakhand": "Uttarakhand",
    "West Bengal": "West_Bengal",
    "Andaman and Nicobar Islands": "Andaman_and_Nicobar_Islands",
    "Chandigarh": "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu": "Dadra_and_Nagar_Haveli_and_Daman_and_Diu",
    "Delhi": "Delhi",
    "Jammu and Kashmir": "Jammu_and_Kashmir",
    "Ladakh": "Ladakh",
    "Lakshadweep": "Lakshadweep",
    "Puducherry": "Puducherry"
};

// ============================================
// COMPREHENSIVE CATEGORY MAPPING FOR ACCURATE IMAGES
// ============================================
const categoryMapping = {
    monuments: {
        "Uttar Pradesh": "Monuments_and_memorials_in_Uttar_Pradesh",
        "Rajasthan": "Monuments_and_memorials_in_Rajasthan", 
        "Maharashtra": "Monuments_and_memorials_in_Maharashtra",
        "Tamil Nadu": "Monuments_and_memorials_in_Tamil_Nadu",
        "Karnataka": "Monuments_and_memorials_in_Karnataka",
        "Madhya Pradesh": "Monuments_and_memorials_in_Madhya_Pradesh",
        "Gujarat": "Monuments_and_memorials_in_Gujarat",
        "Delhi": "Monuments_and_memorials_in_Delhi",
        "Andhra Pradesh": "Monuments_and_memorials_in_Andhra_Pradesh",
        "Telangana": "Monuments_and_memorials_in_Telangana",
        "Kerala": "Monuments_and_memorials_in_Kerala",
        "Odisha": "Monuments_and_memorials_in_Odisha",
        "Punjab": "Monuments_and_memorials_in_Punjab",
        "West Bengal": "Monuments_and_memorials_in_West_Bengal",
        "default": "Monuments_and_memorials_in_India"
    },
    food: {
        "Uttar Pradesh": "Uttar_Pradeshi_cuisine",
        "Rajasthan": "Rajasthani_cuisine",
        "Maharashtra": "Maharashtrian_cuisine", 
        "Tamil Nadu": "Tamil_cuisine",
        "Punjab": "Punjabi_cuisine",
        "West Bengal": "Bengali_cuisine",
        "Kerala": "Kerala_cuisine",
        "Gujarat": "Gujarati_cuisine",
        "Karnataka": "Karnataka_cuisine",
        "Andhra Pradesh": "Andhra_cuisine",
        "Telangana": "Telugu_cuisine",
        "Odisha": "Odia_cuisine",
        "default": "Cuisine_of_India"
    },
    culture: {
        "default": "Culture_of_India"
    },
    festivals: {
        "default": "Festivals_in_India"
    },
    language: {
        "default": "Languages_of_India"
    },
    temperature: {
        "default": "Climate_of_India"
    }
};

// ============================================
// ENHANCED CACHING SYSTEM
// ============================================
const wikiCache = {};
const categoryImageCache = {};

// ============================================
// WIKIMEDIA COMMONS CATEGORY IMAGE FETCHER
// ============================================
async function fetchCategoryImages(categoryTitle, limit = 4, recursionDepth = 0) {
    if (recursionDepth > 2) return [];
    
    const cacheKey = `${categoryTitle}_${limit}`;
    if (categoryImageCache[cacheKey]) return categoryImageCache[cacheKey];

    try {
        const params = new URLSearchParams({
            action: 'query',
            generator: 'categorymembers',
            gcmtitle: `Category:${categoryTitle}`,
            gcmtype: 'file',
            gcmlimit: limit * 4,
            prop: 'imageinfo',
            iiprop: 'url|thumburl|size|mime',
            iiurlwidth: 400,
            format: 'json',
            origin: '*'
        });

        const response = await fetch(`${COMMONS_API}?${params}`);
        const data = await response.json();
        
        let images = [];
        if (data.query?.pages) {
            images = Object.values(data.query.pages)
                .filter(page => page.imageinfo?.[0] && 
                    !page.imageinfo[0].mime.includes('svg') &&
                    page.imageinfo[0].size > 30000)
                .map(page => page.imageinfo[0].thumburl || page.imageinfo[0].url)
                .slice(0, limit);
        }

        // Fallback: Try subcategories
        if (images.length === 0 && recursionDepth === 0) {
            const subcatParams = new URLSearchParams({
                action: 'query',
                list: 'categorymembers',
                cmtitle: `Category:${categoryTitle}`,
                cmtype: 'subcat',
                cmlimit: 5,
                format: 'json',
                origin: '*'
            });

            const subcatResponse = await fetch(`${COMMONS_API}?${subcatParams}`);
            const subcatData = await subcatResponse.json();
            
            if (subcatData.query?.categorymembers) {
                for (const subcat of subcatData.query.categorymembers.slice(0, 3)) {
                    const subImages = await fetchCategoryImages(
                        subcat.title.replace('Category:', ''), 
                        Math.floor(limit/2), 
                        1
                    );
                    images.push(...subImages);
                    if (images.length >= limit) break;
                }
            }
        }

        categoryImageCache[cacheKey] = images.slice(0, limit);
        return categoryImageCache[cacheKey];
    } catch (error) {
        console.error(`Error fetching category images: ${categoryTitle}`, error);
        return [];
    }
}

// ============================================
// CATEGORY-SPECIFIC IMAGE LOADER
// ============================================
async function loadCategorySpecificImages(stateName, category) {
    const mapping = categoryMapping[category];
    let categoryTitle = mapping?.[stateName] || mapping?.default;
    
    // Enhanced fallback system
    if (!categoryTitle) {
        const fallbacks = {
            monuments: "Monuments_and_memorials_in_India",
            food: "Cuisine_of_India",
            culture: "Culture_of_India",
            festivals: "Festivals_in_India"
        };
        categoryTitle = fallbacks[category] || "India";
    }

    console.log(`📸 Loading ${category} images for ${stateName} from Category:${categoryTitle}`);
    return await fetchCategoryImages(categoryTitle, 4);
}

// ============================================
// ORIGINAL WIKIPEDIA FUNCTIONS (KEEP EXISTING)
// ============================================
async function fetchWikipediaSummary(stateName) {
    const wikiTitle = stateWikiMapping[stateName];
    if (!wikiTitle || wikiCache[stateName]) return wikiCache[stateName];
    
    try {
        const response = await fetch(`${WIKIPEDIA_API_BASE}/page/summary/${wikiTitle}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        wikiCache[stateName] = data;
        return data;
    } catch (error) {
        console.error(`Wikipedia error for ${stateName}:`, error);
        return null;
    }
}

async function fetchWikipediaImages(stateName, limit = 5) {
    // Keep your existing Wikipedia image function as backup
    const wikiTitle = stateWikiMapping[stateName];
    if (!wikiTitle) return [];
    
    try {
        const response = await fetch(
            `${WIKIPEDIA_SEARCH_BASE}?action=query&format=json&titles=${wikiTitle}&prop=images&imlimit=${limit}&origin=*`
        );
        const data = await response.json();
        const pages = data.query?.pages;
        if (!pages) return [];
        
        const pageId = Object.keys(pages)[0];
        const images = pages[pageId]?.images || [];
        const imageUrls = [];
        
        for (const img of images.slice(0, limit)) {
            try {
                const imgResponse = await fetch(
                    `${WIKIPEDIA_SEARCH_BASE}?action=query&format=json&titles=${img.title}&prop=imageinfo&iiprop=url&origin=*`
                );
                const imgData = await imgResponse.json();
                const imgPages = imgData.query?.pages;
                if (imgPages) {
                    const imgPageId = Object.keys(imgPages)[0];
                    const url = imgPages[imgPageId]?.imageinfo?.[0]?.url;
                    if (url && !url.includes('svg') && !url.includes('icon')) {
                        imageUrls.push(url);
                    }
                }
            } catch (e) {
                console.error('Image fetch error:', e);
            }
        }
        return imageUrls;
    } catch (error) {
        console.error(`Wikipedia images error for ${stateName}:`, error);
        return [];
    }
}

// ============================================
// ENHANCED STATE DATA CREATOR
// ============================================
function createStateData(stateName, folderName, cultureText, foodText, monumentsText, languageText, temperatureText, festivalsText) {
    return {
        backgroundImage: `images/${folderName}/background.jpg`,
        culture: { text: cultureText, images: [] },
        food: { text: foodText, images: [] },
        monuments: { text: monumentsText, images: [] },
        language: { text: languageText, images: [] },
        temperature: { text: temperatureText, images: [] },
        festivals: { text: festivalsText, images: [] },
        wikiLoaded: false,
        
        async loadWikipediaData() {
            const wikiData = await fetchWikipediaSummary(stateName);
            if (wikiData?.thumbnail) {
                this.backgroundImage = wikiData.thumbnail.source;
            }
            // Wikipedia images as backup only
        },
        
        async loadCategoryImages() {
            const categories = ['culture', 'food', 'monuments', 'festivals', 'language'];
            for (const cat of categories) {
                if (this[cat].images.length === 0) {
                    this[cat].images = await loadCategorySpecificImages(stateName, cat);
                }
            }
        }
    };
}

// ============================================
// YOUR EXISTING STATES DATA (UNCHANGED)
// ============================================
// [Keep all your existing statesData object exactly as is - no changes needed]
const statesData = {
    // ... your complete statesData object from the original code ...
    "Uttar Pradesh": createStateData(/* your existing data */),
    // ... all other states exactly as you have them ...
};

// ============================================
// SUPERCHARGED STATE DATA LOADING
// ============================================
async function loadStateData(stateName) {
    const stateData = statesData[stateName];
    if (!stateData) {
        console.error(`❌ No data for: ${stateName}`);
        return;
    }
    
    // Load Wikipedia summary + background
    if (!stateData.wikiLoaded) {
        await stateData.loadWikipediaData();
        stateData.wikiLoaded = true;
    }
    
    // 🚀 Load CATEGORY-SPECIFIC Commons images (NEW!)
    if (!stateData.categoryImagesLoaded) {
        console.log(`🌟 Loading authentic images for ${stateName}...`);
        await stateData.loadCategoryImages();
        stateData.categoryImagesLoaded = true;
    }
    
    // Update UI
    if (stateDetailBg) {
        stateDetailBg.style.backgroundImage = `url('${stateData.backgroundImage}')`;
    }
    
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    if (contentText) contentText.innerHTML = '<p>Select a category to explore authentic images from Wikimedia Commons!</p>';
    if (contentImages) contentImages.innerHTML = '';
    
    const stateNameElement = document.getElementById('stateName');
    if (stateNameElement) stateNameElement.textContent = stateName;
}
async function switchCategory(category) {
    if (!currentState || !statesData[currentState]) return;
    
    const stateData = statesData[currentState];
    const categoryData = stateData[category];
    currentCategory = category;
 
     categoryButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });
    if (contentText) {
        contentText.innerHTML = `<p>${categoryData.text}</p>`;
    }
    
    if (contentImages) {
        contentImages.innerHTML = '<div class="loading-spinner">📸 Loading authentic images...</div>';
        
        let images = categoryData.images;
        
        // Fallback fetch if empty
        if (images.length === 0) {
            images = await loadCategorySpecificImages(currentState, category);
            categoryData.images = images;
        }
        
        contentImages.innerHTML = '';
        
        if (images.length > 0) {
            images.forEach((url, i) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'image-container';
                
                const img = document.createElement('img');
                img.src = url;
                img.alt = `${currentState} ${category.charAt(0).toUpperCase() + category.slice(1)} (${i+1})`;
                img.className = 'content-image';
                img.loading = 'lazy';
                img.onerror = () => img.style.display = 'none';
                
                imgContainer.appendChild(img);
                contentImages.appendChild(imgContainer);
            });
        } else {
            contentImages.innerHTML = `
                <div class="no-images">
                    <p>📷 No images found for ${category} in ${currentState}</p>
                    <p>Commons is still growing - check other categories!</p>
                </div>
            `;
        }
    }
    
    // Smooth scroll
    const contentArea = document.querySelector('.content-area');
    if (contentArea) contentArea.scrollIntoView({ behavior: 'smooth' });
}
async function navigateToStateDetail(stateName) {
    if (!statesData[stateName]) {
        console.error(`State data not found: ${stateName}`);
        return;
    }
    
    currentState = stateName;
    currentCategory = null;
    
    landingPage.classList.add('hidden');
    explorePage.classList.add('hidden');
    stateDetailPage.classList.remove('hidden');
    
    // 🔥 ENHANCED: Now loads category-specific images!
    await loadStateData(stateName);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}