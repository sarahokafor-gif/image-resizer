/**
 * Image Resizer - Main Application
 * Resizes images for social media, official documents, and custom sizes
 */

const ImageResizer = {
    originalImage: null,
    originalWidth: 0,
    originalHeight: 0,
    targetWidth: 0,
    targetHeight: 0,
    aspectRatioLocked: true,
    aspectRatio: 1,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // File input and drop zone
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        dropZone?.addEventListener('click', () => fileInput?.click());
        dropZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone?.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        dropZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.loadImage(file);
            }
        });

        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadImage(file);
            }
        });

        // Change image button
        document.getElementById('changeImageBtn')?.addEventListener('click', () => {
            fileInput?.click();
        });

        // Size category tabs
        document.querySelectorAll('.size-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                this.applyPreset(parseInt(button.dataset.width), parseInt(button.dataset.height));
            });
        });

        // Custom size inputs
        const customWidth = document.getElementById('customWidth');
        const customHeight = document.getElementById('customHeight');

        customWidth?.addEventListener('input', () => {
            if (this.aspectRatioLocked && this.originalImage) {
                const newHeight = Math.round(parseInt(customWidth.value) / this.aspectRatio);
                customHeight.value = newHeight;
            }
        });

        customHeight?.addEventListener('input', () => {
            if (this.aspectRatioLocked && this.originalImage) {
                const newWidth = Math.round(parseInt(customHeight.value) * this.aspectRatio);
                customWidth.value = newWidth;
            }
        });

        // Lock aspect ratio button
        document.getElementById('lockAspectBtn')?.addEventListener('click', () => {
            this.toggleAspectLock();
        });

        // Apply custom size button
        document.getElementById('applyCustomBtn')?.addEventListener('click', () => {
            const width = parseInt(document.getElementById('customWidth').value);
            const height = parseInt(document.getElementById('customHeight').value);
            if (width > 0 && height > 0) {
                this.applyPreset(width, height);
            }
        });

        // Quality slider
        document.getElementById('outputQuality')?.addEventListener('input', (e) => {
            document.getElementById('qualityValue').textContent = e.target.value;
            this.updatePreview();
        });

        // Format change
        document.getElementById('outputFormat')?.addEventListener('change', () => {
            this.updatePreview();
        });

        // Download button
        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            this.downloadImage();
        });

        // Help modal
        document.getElementById('helpBtn')?.addEventListener('click', () => {
            this.showHelp();
        });

        document.querySelectorAll('.help-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchHelpTab(e.target.dataset.tab);
            });
        });

        document.getElementById('helpModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'helpModal') {
                this.closeHelp();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeHelp();
            }
        });
    },

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.originalWidth = img.width;
                this.originalHeight = img.height;
                this.aspectRatio = img.width / img.height;

                // Show preview
                document.getElementById('originalImage').src = e.target.result;
                document.getElementById('originalSize').textContent = `${img.width} × ${img.height} px`;

                // Update custom inputs with original size
                document.getElementById('customWidth').value = img.width;
                document.getElementById('customHeight').value = img.height;

                // Show sections
                document.getElementById('dropZone').classList.add('hidden');
                document.getElementById('imagePreview').classList.remove('hidden');
                document.getElementById('resizeSection').classList.remove('hidden');

                // Apply default size (original)
                this.applyPreset(img.width, img.height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    switchCategory(category) {
        // Update tabs
        document.querySelectorAll('.size-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Show/hide preset grids
        document.getElementById('socialPresets').classList.toggle('hidden', category !== 'social');
        document.getElementById('officialPresets').classList.toggle('hidden', category !== 'official');
        document.getElementById('webPresets').classList.toggle('hidden', category !== 'web');
        document.getElementById('customSize').classList.toggle('hidden', category !== 'custom');
    },

    applyPreset(width, height) {
        this.targetWidth = width;
        this.targetHeight = height;

        // Update custom inputs
        document.getElementById('customWidth').value = width;
        document.getElementById('customHeight').value = height;

        // Highlight selected preset
        document.querySelectorAll('.preset-btn').forEach(btn => {
            const isSelected = parseInt(btn.dataset.width) === width && parseInt(btn.dataset.height) === height;
            btn.classList.toggle('selected', isSelected);
        });

        this.updatePreview();
    },

    toggleAspectLock() {
        this.aspectRatioLocked = !this.aspectRatioLocked;
        const btn = document.getElementById('lockAspectBtn');
        btn.classList.toggle('active', this.aspectRatioLocked);

        // Update icon
        if (this.aspectRatioLocked) {
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>`;
        } else {
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"></path>
            </svg>`;
        }
    },

    updatePreview() {
        if (!this.originalImage || !this.targetWidth || !this.targetHeight) return;

        const canvas = document.getElementById('resizedCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = this.targetWidth;
        canvas.height = this.targetHeight;

        // Draw resized image
        ctx.drawImage(this.originalImage, 0, 0, this.targetWidth, this.targetHeight);

        // Update info
        document.getElementById('resizedSize').textContent = `${this.targetWidth} × ${this.targetHeight} px`;

        // Show download section
        document.getElementById('downloadSection').classList.remove('hidden');
        document.getElementById('finalSize').textContent = `${this.targetWidth} × ${this.targetHeight} px`;
        document.getElementById('finalFormat').textContent = document.getElementById('outputFormat').value.toUpperCase();
    },

    downloadImage() {
        const canvas = document.getElementById('resizedCanvas');
        const format = document.getElementById('outputFormat').value;
        const quality = parseInt(document.getElementById('outputQuality').value) / 100;

        let mimeType = 'image/jpeg';
        let extension = 'jpg';

        if (format === 'png') {
            mimeType = 'image/png';
            extension = 'png';
        } else if (format === 'webp') {
            mimeType = 'image/webp';
            extension = 'webp';
        }

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resized_${this.targetWidth}x${this.targetHeight}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, mimeType, quality);
    },

    showHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },

    closeHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    switchHelpTab(tabName) {
        document.querySelectorAll('.help-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        const panels = {
            'quickstart': 'quickstartPanel',
            'presets': 'presetsPanel',
            'custom': 'customPanel'
        };

        Object.entries(panels).forEach(([name, panelId]) => {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.toggle('hidden', name !== tabName);
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ImageResizer.init();
});
