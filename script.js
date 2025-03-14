document.addEventListener('DOMContentLoaded', () => {
    const breedsContainer = document.getElementById('breeds-container');
    const gallery = document.getElementById('gallery');
    const selectedBreedEl = document.getElementById('selected-breed');
    const loadingEl = document.getElementById('loading');
    const refreshBtn = document.getElementById('refresh-btn');
    const errorMessage = document.getElementById('error-message');
    const welcomeDisplay = document.getElementById('welcome-display');
    
    let currentBreed = '';
    const MAX_BREED_BUTTONS = 18; 
    
    async function fetchBreeds() {
        try {
            loadingEl.style.display = 'block';
            
            const response = await fetch('https://dog.ceo/api/breeds/list/all');
            const data = await response.json();
            
            if (data.status === 'success') {
                const breeds = Object.keys(data.message);
                
                // Limitar e randomizar as raças mostradas
                const shuffledBreeds = breeds
                    .sort(() => 0.5 - Math.random())
                    .slice(0, MAX_BREED_BUTTONS);
                
                renderBreedButtons(shuffledBreeds);
            } else {
                throw new Error('Falha ao carregar raças');
            }
        } catch (error) {
            console.error('Erro ao buscar raças:', error);
            errorMessage.textContent = 'Não foi possível carregar a lista de raças. Por favor, recarregue a página.';
            errorMessage.classList.add('show');
        } finally {
            loadingEl.style.display = 'none';
        }
    }
    
    // Função para renderizar botões de raças
    function renderBreedButtons(breeds) {
        breedsContainer.innerHTML = '';
        
        breeds.forEach(breed => {
            const button = document.createElement('button');
            button.classList.add('breed-btn');
            button.textContent = breed.charAt(0).toUpperCase() + breed.slice(1);
            
            button.addEventListener('click', async () => {
                document.querySelectorAll('.breed-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                button.classList.add('active');
                
                currentBreed = breed;
                selectedBreedEl.textContent = breed;
                
                if (welcomeDisplay) {
                    welcomeDisplay.classList.add('hidden');
                }
                
                await fetchDogImages(breed);
            });
            
            breedsContainer.appendChild(button);
        });
    }
    
    // Função para buscar imagens de cães com async/await
    async function fetchDogImages(breed) {
        try {
            errorMessage.classList.remove('show');
            
            loadingEl.style.display = 'block';
            
            gallery.classList.remove('show');
            
            const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random/4`);
            const data = await response.json();
            
            if (data.status === 'success') {
                renderGallery(data.message);
                refreshBtn.classList.add('show');
            } else {
                throw new Error('Falha ao carregar imagens');
            }
        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
            errorMessage.textContent = 'Não foi possível carregar as imagens. Por favor, tente novamente.';
            errorMessage.classList.add('show');
            gallery.innerHTML = '';
        } finally {
            loadingEl.style.display = 'none';
        }
    }
    
    function renderGallery(images) {
        gallery.innerHTML = '';
        
        images.forEach(imageUrl => {
            const item = document.createElement('div');
            item.classList.add('gallery-item');
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `${currentBreed} dog`;
            img.loading = 'lazy';
            
            img.onload = () => {
                item.classList.add('loaded');
            };
            
            item.appendChild(img);
            gallery.appendChild(item);
        });
        
        setTimeout(() => {
            gallery.classList.add('show');
        }, 100);
    }
    
    // Botão para atualizar imagens
    refreshBtn.addEventListener('click', async () => {
        if (currentBreed) {
            await fetchDogImages(currentBreed);
            refreshBtn.classList.add('pulse');
            setTimeout(() => {
                refreshBtn.classList.remove('pulse');
            }, 1000);
        }
    });
    
    fetchBreeds();
});
