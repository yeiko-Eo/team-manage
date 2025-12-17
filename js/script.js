class TeamManager {
    constructor() {
        this.teams = [];
        this.nextTeamId = 1;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.renderTeams();
        this.bindEvents();
        this.updateStats();
        
        // Add two initial teams
        if (this.teams.length === 0) {
            this.addTeam('Equipo 1');
            this.addTeam('Equipo 2');
        }
    }

    addTeam(name = '') {
        const team = {
            id: this.nextTeamId++,
            name: name || `Equipo ${this.teams.length + 1}`,
            score: 0,
            participants: []
        };
        
        this.teams.push(team);
        this.saveToStorage();
        this.renderTeam(team);
        this.updateStats();
        this.showToast('Equipo agregado correctamente', 'success');
        
        return team;
    }

    removeTeam(teamId) {
        if (this.teams.length <= 1) {
            this.showToast('Debe haber al menos un equipo', 'error');
            return;
        }
        
        this.teams = this.teams.filter(team => team.id !== teamId);
        this.saveToStorage();
        document.getElementById(`team-${teamId}`).remove();
        this.updateStats();
        this.showToast('Equipo eliminado', 'info');
    }

    updateTeamName(teamId, newName) {
        const team = this.teams.find(t => t.id === teamId);
        if (team) {
            team.name = newName || `Equipo ${teamId}`;
            this.saveToStorage();
        }
    }

    updateScore(teamId, change) {
        const team = this.teams.find(t => t.id === teamId);
        if (team) {
            team.score = Math.max(0, team.score + change);
            this.saveToStorage();
            this.renderTeamScore(team);
            this.updateStats();
            
            // Animation effect
            const scoreElement = document.getElementById(`score-${teamId}`);
            if (change > 0) {
                scoreElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    scoreElement.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }

    addParticipant(teamId, participantName) {
        const team = this.teams.find(t => t.id === teamId);
        if (team && participantName.trim()) {
            if (team.participants.includes(participantName.trim())) {
                this.showToast('Este participante ya existe', 'warning');
                return;
            }
            
            team.participants.push(participantName.trim());
            this.saveToStorage();
            this.renderTeamParticipants(team);
            this.updateStats();
            this.showToast('Participante agregado', 'success');
        }
    }

    removeParticipant(teamId, participantName) {
        const team = this.teams.find(t => t.id === teamId);
        if (team) {
            team.participants = team.participants.filter(p => p !== participantName);
            this.saveToStorage();
            this.renderTeamParticipants(team);
            this.updateStats();
        }
    }

    renderTeams() {
        const teamsGrid = document.getElementById('teamsGrid');
        teamsGrid.innerHTML = '';
        this.teams.forEach(team => this.renderTeam(team));
    }

    renderTeam(team) {
        const teamsGrid = document.getElementById('teamsGrid');
        
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.id = `team-${team.id}`;
        teamCard.innerHTML = `
            <div class="team-header">
                <input type="text" 
                       class="team-name-input" 
                       value="${team.name}"
                       onchange="teamManager.updateTeamName(${team.id}, this.value)"
                       placeholder="Nombre del equipo">
                <button class="delete-team-btn" onclick="teamManager.removeTeam(${team.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <div class="score-display">
                <span class="score-label">PUNTOS</span>
                <span class="score-value" id="score-${team.id}">${team.score}</span>
            </div>
            
            <div class="score-controls">
                <button class="score-btn add-points" onclick="teamManager.updateScore(${team.id}, 1)">
                    <i class="fas fa-plus"></i> 1 Punto
                </button>
                <button class="score-btn remove-points" onclick="teamManager.updateScore(${team.id}, -1)">
                    <i class="fas fa-minus"></i> 1 Punto
                </button>
            </div>
            
            <div class="participants-section">
                <h3 class="section-title">
                    <i class="fas fa-users"></i>
                    Participantes (${team.participants.length})
                </h3>
                <ul class="participants-list" id="participants-${team.id}">
                    ${team.participants.map(participant => `
                        <li class="participant-item">
                            <span class="participant-name">${participant}</span>
                            <button class="delete-participant-btn" 
                                    onclick="teamManager.removeParticipant(${team.id}, '${participant}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </li>
                    `).join('')}
                </ul>
                
                <div class="add-participant-form">
                    <input type="text" 
                           class="add-participant-input" 
                           id="participant-input-${team.id}"
                           placeholder="Nombre del participante"
                           onkeypress="if(event.key === 'Enter') {
                               teamManager.addParticipant(${team.id}, this.value);
                               this.value = '';
                           }">
                    <button class="add-participant-btn" 
                            onclick="const input = document.getElementById('participant-input-${team.id}');
                                     teamManager.addParticipant(${team.id}, input.value);
                                     input.value = '';">
                        <i class="fas fa-user-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `;
        
        teamsGrid.appendChild(teamCard);
    }

    renderTeamScore(team) {
        const scoreElement = document.getElementById(`score-${team.id}`);
        if (scoreElement) {
            scoreElement.textContent = team.score;
        }
    }

    renderTeamParticipants(team) {
        const participantsList = document.getElementById(`participants-${team.id}`);
        if (participantsList) {
            participantsList.innerHTML = team.participants.map(participant => `
                <li class="participant-item">
                    <span class="participant-name">${participant}</span>
                    <button class="delete-participant-btn" 
                            onclick="teamManager.removeParticipant(${team.id}, '${participant}')">
                        <i class="fas fa-times"></i>
                    </button>
                </li>
            `).join('');
        }
    }

    updateStats() {
        const totalTeams = this.teams.length;
        const totalPoints = this.teams.reduce((sum, team) => sum + team.score, 0);
        const totalParticipants = this.teams.reduce((sum, team) => sum + team.participants.length, 0);
        
        document.getElementById('totalTeams').textContent = totalTeams;
        document.getElementById('totalPoints').textContent = totalPoints;
        document.getElementById('totalParticipants').textContent = totalParticipants;
    }

    resetAll() {
        if (confirm('¿Está seguro de que desea reiniciar todos los equipos? Se perderán todos los datos.')) {
            this.teams.forEach(team => {
                team.score = 0;
                team.participants = [];
            });
            this.saveToStorage();
            this.renderTeams();
            this.updateStats();
            this.showToast('Todos los equipos han sido reiniciados', 'success');
        }
    }

    exportData() {
        const data = {
            teams: this.teams,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `equipos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Datos exportados correctamente', 'success');
    }

    saveToStorage() {
        localStorage.setItem('teamManagerData', JSON.stringify({
            teams: this.teams,
            nextTeamId: this.nextTeamId
        }));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('teamManagerData');
        if (saved) {
            const data = JSON.parse(saved);
            this.teams = data.teams || [];
            this.nextTeamId = data.nextTeamId || this.teams.length + 1;
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    bindEvents() {
        // Add Team Button
        document.getElementById('addTeamBtn').addEventListener('click', () => {
            this.addTeam();
        });
        
        // Reset All Button
        document.getElementById('resetAllBtn').addEventListener('click', () => {
            this.resetAll();
        });
        
        // Export Button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        // Allow dropping JSON files to import
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/json') {
                this.importData(file);
            }
        });
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.teams) {
                    this.teams = data.teams;
                    this.nextTeamId = Math.max(...this.teams.map(t => t.id), 0) + 1;
                    this.saveToStorage();
                    this.renderTeams();
                    this.updateStats();
                    this.showToast('Datos importados correctamente', 'success');
                }
            } catch (error) {
                this.showToast('Error al importar el archivo', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application
const teamManager = new TeamManager();