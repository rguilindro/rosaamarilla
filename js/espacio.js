        const container = document.getElementById("webgl-container");
        const showerBox = document.getElementById("shower-box");
        const pauseIndicator = document.getElementById("pause-indicator");
        const speedSlider = document.getElementById("orbit-speed-slider");

        let isPaused = false;
        let isShowerActive = true;
        let showerInterval = null;
        let orbitSpeedFactor = 0.035;

        // ===================================================
        // REPRODUCTOR DE MÚSICA (Audio MP3 Personalizable)
        // ===================================================
        // Puedes cambiar 'musica.mp3' por la ruta de tu archivo de música
        // o por un enlace web directo a un archivo MP3.
        const audioPath = './siempresere.mp3'; 
        const bgAudio = new Audio(audioPath);
        bgAudio.loop = true; // Repetir la canción indefinidamente
        bgAudio.volume = 0.8; // Volumen (0.0 a 1.0)
        let isAudioPlaying = false;

        function toggleAudio() {
            const btnText = document.getElementById('audio-status-text');
            const icon = document.getElementById('audio-icon');

            if (!isAudioPlaying) {
                bgAudio.play().then(() => {
                    isAudioPlaying = true;
                    btnText.textContent = "Pausar Música";
                    icon.className = "fa-solid fa-compact-disc fa-spin me-2";
                }).catch(err => {
                    console.error("No se pudo reproducir la música:", err);
                    alert("Asegúrate de colocar tu archivo 'musica.mp3' en la misma carpeta del proyecto.");
                });
            } else {
                bgAudio.pause();
                isAudioPlaying = false;
                btnText.textContent = "Reproducir Música";
                icon.className = "fa-solid fa-compact-disc me-2";
            }
        }

        // 1. Escena y Niebla Atmosférica
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x02000a);
        scene.fog = new THREE.FogExp2(0x02000a, 0.0007);

        // 2. Cámara Perspectiva
        const camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            1,
            4000
        );
        camera.position.set(0, 320, 950);

        // 3. WebGL Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        // 4. OrbitControls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.minDistance = 300;
        controls.maxDistance = 1600;

        // 5. Iluminación
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        scene.add(ambientLight);

        const centerLight = new THREE.PointLight(0xffd700, 4.2, 1600);
        centerLight.position.set(0, 0, 0);
        scene.add(centerLight);

        // 6. Textura de Estrellas
        function createStarTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 240, 180, 0.9)');
            gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        }

        const starTexture = createStarTexture();

        // Estrellas Distantes
        const deepStarsGeo = new THREE.BufferGeometry();
        const deepStarCount = 8000;
        const deepPos = new Float32Array(deepStarCount * 3);
        const deepCols = new Float32Array(deepStarCount * 3);

        for (let i = 0; i < deepStarCount; i++) {
            const radius = 900 + Math.random() * 1800;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            deepPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            deepPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            deepPos[i * 3 + 2] = radius * Math.cos(phi);

            const rnd = Math.random();
            if (rnd > 0.65) {
                deepCols[i * 3] = 1.0; deepCols[i * 3 + 1] = 0.9; deepCols[i * 3 + 2] = 0.4;
            } else if (rnd > 0.35) {
                deepCols[i * 3] = 0.95; deepCols[i * 3 + 1] = 0.5; deepCols[i * 3 + 2] = 0.85;
            } else {
                deepCols[i * 3] = 0.8; deepCols[i * 3 + 1] = 0.95; deepCols[i * 3 + 2] = 1.0;
            }
        }

        deepStarsGeo.setAttribute("position", new THREE.BufferAttribute(deepPos, 3));
        deepStarsGeo.setAttribute("color", new THREE.BufferAttribute(deepCols, 3));

        const deepStarsMat = new THREE.PointsMaterial({
            size: 3.5,
            map: starTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const deepStars = new THREE.Points(deepStarsGeo, deepStarsMat);
        scene.add(deepStars);

        // Estrellas Cercanas y Brillantes
        const brightStarsGeo = new THREE.BufferGeometry();
        const brightStarCount = 1200;
        const brightPos = new Float32Array(brightStarCount * 3);

        for (let i = 0; i < brightStarCount; i++) {
            const radius = 400 + Math.random() * 1100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            brightPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            brightPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            brightPos[i * 3 + 2] = radius * Math.cos(phi);
        }

        brightStarsGeo.setAttribute("position", new THREE.BufferAttribute(brightPos, 3));

        const brightStarsMat = new THREE.PointsMaterial({
            size: 8,
            map: starTexture,
            color: 0xfff3a1,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const brightStars = new THREE.Points(brightStarsGeo, brightStarsMat);
        scene.add(brightStars);

        // Polvo Cósmico Dorado
        const dustGeo = new THREE.BufferGeometry();
        const dustCount = 2500;
        const dustPos = new Float32Array(dustCount * 3);

        for (let i = 0; i < dustCount; i++) {
            dustPos[i * 3] = (Math.random() - 0.5) * 1600;
            dustPos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            dustPos[i * 3 + 2] = (Math.random() - 0.5) * 1600;
        }

        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 2.5,
            color: 0xffd700,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const dustParticles = new THREE.Points(dustGeo, dustMat);
        scene.add(dustParticles);

        // Estrellas Fugaces
        const shootingStars = [];
        const maxShootingStars = 6;

        function createShootingStar() {
            const lineGeo = new THREE.BufferGeometry();
            const startX = (Math.random() - 0.5) * 1800;
            const startY = 300 + Math.random() * 500;
            const startZ = (Math.random() - 0.5) * 1200;

            const positions = new Float32Array([
                startX, startY, startZ,
                startX - 120, startY - 80, startZ - 60
            ]);
            lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const lineMat = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9
            });

            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);

            return {
                mesh: line,
                speedX: -8 - Math.random() * 12,
                speedY: -6 - Math.random() * 8,
                speedZ: -4 - Math.random() * 6,
                life: 1.0
            };
        }

        // Núcleo Galáctico
        const cosmicCenterGroup = new THREE.Group();

        const centerCoreGeo = new THREE.SphereGeometry(62, 64, 64);
        const centerCoreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const centerCore = new THREE.Mesh(centerCoreGeo, centerCoreMat);
        cosmicCenterGroup.add(centerCore);

        const glowGeo = new THREE.SphereGeometry(66, 64, 64);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        cosmicCenterGroup.add(glowMesh);

        const ring1Geo = new THREE.RingGeometry(80, 210, 128);
        const ring1Mat = new THREE.MeshBasicMaterial({
            color: 0xec4899,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.rotation.x = Math.PI / 2.3;
        cosmicCenterGroup.add(ring1);

        const ring2Geo = new THREE.RingGeometry(120, 190, 128);
        const ring2Mat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.x = Math.PI / 1.7;
        cosmicCenterGroup.add(ring2);

        scene.add(cosmicCenterGroup);

        // Textura de Girasol
        function createSunflowerTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, 256, 256);
            ctx.font = '180px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.shadowColor = 'rgba(255, 215, 0, 0.95)';
            ctx.shadowBlur = 28;
            ctx.fillText('🌻', 128, 136);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        }

        const sunflowerTexture = createSunflowerTexture();

        // Sistema Orbital de Girasoles 3D
        const sunflowers = [];
        const sunflowerCount = 68;

        for (let i = 0; i < sunflowerCount; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: sunflowerTexture,
                transparent: true,
                depthWrite: false
            });

            const sprite = new THREE.Sprite(spriteMaterial);
            const spriteSize = 38 + Math.random() * 42;
            sprite.scale.set(spriteSize, spriteSize, 1.0);

            const orbitRadius = 160 + Math.random() * 640;
            const orbitAngle = Math.random() * Math.PI * 2;
            const inclination = (Math.random() - 0.5) * Math.PI * 0.75;
            const orbitSpeed = (0.008 + Math.random() * 0.018) * (Math.random() < 0.5 ? 1 : -1);

            scene.add(sprite);

            sunflowers.push({
                mesh: sprite,
                radius: orbitRadius,
                angle: orbitAngle,
                inclination: inclination,
                speed: orbitSpeed,
                bobOffset: Math.random() * Math.PI * 2
            });
        }

        // Lista de Frases Cariñosas
        const affectionWords = [
            "Isabel ❤️", "Mi Universo 🌌", "Mi Sol 🌻", "Te Amo", "Mi Vida",
            "Mi Lugar Favorito", "Siempre Tú", "Mi Estrella ✨", "Eres Mágica",
            "Coincidencia Favorita", "Mi Cielo", "Felicidad", "Eternidad ✨",
            "Mi Amor ❤️", "Luz de Mi Vida", "Ternura Pura", "Girasol Dorado 🌻",
            "Mi Regalo del Cielo", "Te Adoro", "Tú y Yo",
             "Mi Estrella Favorita ✨", "Isabel, Eres Mi Sol ☀️",  "Luz Cósmica 🌌", "Mi Galaxia 💫",
             "Isabel, Estrella Radiante ⭐", "Mi Lugar Seguro 🫶🏻", "Ternura Infinita 🌷", 
             "Girasol Dorado 🌻", "Magia Infinita ✨", 
             "Isabel, Mi Universo de Paz 🌌", "Mi Cielo Bonito 💕", 
             "Dulce Casualidad 🦋", "Mi Constelación 🌟", "Isabel, Mi Brillito ✨",
              "Mi Luna Favorita 🌙", "Princesa de Estrellas 👑",
               "Mi Pedacito de Cielo ☁️", "Sonrisa Celestial 😊✨", "Isabel, Mi Sueño Bonito 💭", 
               "Flor de Primavera 🌸", "Mi Estrella Polar ⭐", "Encanto Natural 🌷", 
               "Mi Alegría Favorita 🥰", "Isabel, Corazón de Oro 💛", "Mi Luz Favorita 🕯️",
                "Belleza Cósmica 🌌", "Mi Dulce Inspiración 🎀", "Ángel Bonito 😇", 
                "Isabel, Mi Universo Entero 🌎✨", "Brillo Infinito 💫", "Mi Casualidad Perfecta 🦋", 
                "Cielo de Mis Días ☀️", "Mi Flor Más Bonita 🌹", "Dulzura Celestial 🍯", "Mi Estrellita ✨", 
                "Isabel, Alma Radiante 🤍", "Mi Paz Favorita 🕊️", "Encanto de Mujer 🌷", "Mi Pequeña Galaxia 🌌", 
                "Sonrisa de Sol ☀️", "Isabel, Mi Sueño Realizado 💫", "Luz de Mis Ojos ✨", "Mi Bonita Casualidad 🦋", 
                "Corazón Encantador 💗", "Mi Cielo Estrellado 🌠", "Dulce Melodía 🎶", "Isabel, Mi Inspiración Diaria 🌸",
                 "Belleza Infinita 💫", "Mi Rincón Favorito 🏡", "Princesa de Mi Universo 👑", "Mi Amanecer Favorito 🌅", 
                 "Mirada Hipnotizante ✨", "Mi Flor de Luz 🌼", "Isabel, Encanto Inigualable 💕", "Mi Constelación Favorita 🌌",
                  "Sonrisa Mágica 🪄", "Mi Luna Llena 🌕", "Dulce Estrellita ⭐", "Mi Paz en el Caos 🕊️",
                   "Isabel, Cielo de Mi Corazón 💙", "Mi Persona Bonita 🌷", "Radiante Isabel ✨", "Mi Solcito ☀️", 
                   "Belleza de Otro Mundo 🌎💫", "Mi Dulce Refugio 🫶🏻", "Estrella de Mis Noches 🌙",
                    "Isabel, Mi Sueño Favorito 💭", "Magia Hecha Mujer ✨", "Mi Primavera 🌸", "Dulce Brillo 💫",
                     "Mi Pequeño Universo 🌌", 
                     "Sonrisa Que Ilumina ☀️", "Mi Ángel Celestial 😇",
                      "Isabel, Corazón Hermoso 💗", "Mi Estrella Fugaz 🌠", "Encanto de Mi Cielo ☁️", 
                      "Mi Luz en la Oscuridad 🕯️", "Isabel, Mi Constelación 🌟", 
                      "Mi Dulce Melodía 🎶", "Belleza que Hipnotiza ✨", "Mi Girasol 🌻", 
                      "Mi Cielo Favorito 💙", "Ternura Hecha Persona 🥹",
                       "Isabel, Mi Razón de Sonreír 😊", "Mi Brillito Especial ✨", "Dulce Encanto 💕",
                        "Mi Universo Bonito 🌌", "Estrella de Mi Cielo ⭐", "Isabel, Mi Sueño de Colores 🌈", 
                        "Magia en Persona 🪄", "Mi Flor Favorita 🌹", "Luz Que Abraza 🤍", "Mi Constelación de Paz 🌌", 
                        "Sonrisa Inolvidable 🥰", "Isabel, Mi Cielo Rosado 🌅", "Dulzura Infinita 🍓", 
                        "Mi Estrella Radiante ✨", "Isabel, Mi Lugar Bonito 🫶🏻", "Mi Casualidad Más Linda 🦋", 
                        "Isabel, Mi Universo Favorito 🌌❤️"
        ];

        // Lluvia de Frases
        function spawnShowerWord() {
            if (!isShowerActive || isPaused) return;

            const wordEl = document.createElement('div');
            wordEl.className = 'shower-word';

            const text = affectionWords[Math.floor(Math.random() * affectionWords.length)];
            wordEl.textContent = text;

            const posX = Math.random() * (window.innerWidth - 180) + 20;
            const duration = Math.random() * 3 + 5;

            wordEl.style.left = `${posX}px`;
            wordEl.style.animationDuration = `${duration}s`;

            showerBox.appendChild(wordEl);

            setTimeout(() => {
                wordEl.remove();
            }, duration * 1000 + 200);
        }

        function startShower() {
            if (showerInterval) clearInterval(showerInterval);
            showerInterval = setInterval(spawnShowerWord, 850);
        }

        function toggleShower(e) {
            if (e) e.stopPropagation();
            isShowerActive = !isShowerActive;
            const btnText = document.getElementById('shower-btn-text');

            if (isShowerActive) {
                btnText.textContent = "Pausar Lluvia";
                startShower();
            } else {
                btnText.textContent = "Reanudar Lluvia";
                if (showerInterval) clearInterval(showerInterval);
            }
        }

        // Control de Pausa
        container.addEventListener('click', () => {
            isPaused = !isPaused;
            if (isPaused) {
                pauseIndicator.classList.add('show');
            } else {
                pauseIndicator.classList.remove('show');
            }
        });

        // Slider Velocidad
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                orbitSpeedFactor = parseFloat(e.target.value) / 1000;
            });
        }

        // Cambiador de Temas
        function setNebulaTheme(themeKey) {
            document.querySelectorAll('.btn-group .btn').forEach(btn => btn.classList.remove('active'));

            if (themeKey === 'purple') {
                document.getElementById('theme-purple').classList.add('active');
                ring1Mat.color.setHex(0xec4899);
                ring2Mat.color.setHex(0xffd700);
                scene.background.setHex(0x02000a);
            } else if (themeKey === 'blue') {
                document.getElementById('theme-blue').classList.add('active');
                ring1Mat.color.setHex(0x38bdf8);
                ring2Mat.color.setHex(0x818cf8);
                scene.background.setHex(0x02091d);
            } else if (themeKey === 'gold') {
                document.getElementById('theme-gold').classList.add('active');
                ring1Mat.color.setHex(0xfbbf24);
                ring2Mat.color.setHex(0xf43f5e);
                scene.background.setHex(0x140800);
            }
        }

        // Resizing Ventana
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Bucle Principal de Renderizado
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            if (!isPaused) {
                sunflowers.forEach((sf) => {
                    sf.angle += sf.speed * (orbitSpeedFactor * 25);

                    const x = Math.cos(sf.angle) * sf.radius;
                    const z = Math.sin(sf.angle) * sf.radius;
                    const y = Math.sin(sf.angle * 2 + sf.bobOffset) * 45 * Math.sin(sf.inclination);

                    sf.mesh.position.set(x, y, z);
                });

                cosmicCenterGroup.rotation.y += 0.003;
                ring1.rotation.z += 0.002;
                ring2.rotation.z -= 0.0015;

                deepStars.rotation.y += 0.0003;
                brightStars.rotation.y += 0.0005;
                dustParticles.rotation.y -= 0.0004;

                brightStarsMat.size = 8 + Math.sin(elapsedTime * 3) * 3;

                if (Math.random() < 0.02 && shootingStars.length < maxShootingStars) {
                    shootingStars.push(createShootingStar());
                }

                for (let i = shootingStars.length - 1; i >= 0; i--) {
                    const st = shootingStars[i];
                    st.mesh.position.x += st.speedX;
                    st.mesh.position.y += st.speedY;
                    st.mesh.position.z += st.speedZ;
                    st.life -= 0.015;
                    st.mesh.material.opacity = st.life;

                    if (st.life <= 0) {
                        scene.remove(st.mesh);
                        st.mesh.geometry.dispose();
                        st.mesh.material.dispose();
                        shootingStars.splice(i, 1);
                    }
                }
            }

            controls.update();
            renderer.render(scene, camera);
        }

        // Inicialización
        startShower();
        animate();