function openApp(appId) {
            document.getElementById('portal-view').classList.add('hidden');
            document.getElementById('portal-view').classList.remove('flex');
            
            document.getElementById('awandrive-view').classList.add('hidden');
            document.getElementById('survey-view').classList.add('hidden');
            document.getElementById('awandrive-view').classList.remove('flex');
            document.getElementById('survey-view').classList.remove('flex');

            if (appId === 'awandrive') {
                document.getElementById('awandrive-view').classList.remove('hidden');
                document.getElementById('awandrive-view').classList.add('flex');
                awanRender(); // Pastikan AwanDrive dirender dengan benar saat dibuka
            } else if (appId === 'survey') {
                document.getElementById('survey-view').classList.remove('hidden');
                document.getElementById('survey-view').classList.add('flex');
                if (window.lucide) lucide.createIcons(); // Re-render icons
            }
            window.scrollTo(0, 0);
        }