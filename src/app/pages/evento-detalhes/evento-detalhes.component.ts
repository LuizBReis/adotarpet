import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService, Evento } from '../../services/evento.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';

declare let L: any;

@Component({
  selector: 'app-evento-detalhes',
  templateUrl: './evento-detalhes.component.html',
  styleUrls: ['./evento-detalhes.component.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
})
export class EventoDetalhesComponent implements OnInit, OnDestroy, AfterViewInit {
  evento: Evento | null = null;
  map: any = null;
  mapReady = false;
  private mapInitialized = false;
  private coordinatesCache: { [key: string]: { lat: number; lon: number } } = {}; // Cache simples

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService
  ) {}

  ngOnInit(): void {
    this.loadLeafletAssets().then(() => {
      this.loadEventData();
    });
  }

  ngAfterViewInit(): void {
    this.mapInitialized = true;
  }

  ngOnDestroy(): void {
    this.cleanupMap();
  }

  private loadLeafletAssets(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof L !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  private loadEventData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.eventoService.getEventoPorId(id).subscribe({
      next: (data: Evento) => {
        this.evento = data;
        if (data.local) {
          this.fetchCoordinates(data.local, data.cep);
        } else {
          // Fallback para Brasil se não houver local
          this.initMap(-14.2350, -51.9253, 4);
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar evento:', err);
        this.router.navigate(['/eventos']);
      },
    });
  }

  private async fetchCoordinates(endereco: string, cep?: string): Promise<void> {
    try {
      // 1. Gera uma chave única para o cache
      const cacheKey = `${endereco}_${cep || ''}`.toLowerCase();
      if (this.coordinatesCache[cacheKey]) {
        console.log('Usando cache para:', cacheKey);
        this.initMap(this.coordinatesCache[cacheKey].lat, this.coordinatesCache[cacheKey].lon);
        return;
      }

      // 2. Padronização do endereço
      let enderecoFormatado = this.formatarEndereco(endereco, cep);

      // 3. Tentativa com endereço completo
      let coordenadas = await this.buscarCoordenadasNominatim(enderecoFormatado);

      // 4. Fallback: Tentar apenas com CEP se falhar
      if (!coordenadas && cep) {
        enderecoFormatado = `CEP ${cep}, Brasil`;
        coordenadas = await this.buscarCoordenadasNominatim(enderecoFormatado);
      }

      // 5. Se encontrou coordenadas, armazena no cache e inicializa o mapa
      if (coordenadas) {
        this.coordinatesCache[cacheKey] = coordenadas;
        console.log('Localização encontrada:', {
          enderecoPesquisado: enderecoFormatado,
          latitude: coordenadas.lat,
          longitude: coordenadas.lon,
        });
        this.initMap(coordenadas.lat, coordenadas.lon);
      } else {
        console.warn('Não foi possível encontrar a localização para:', endereco);
        // Fallback para Brasil
        this.initMap(-14.2350, -51.9253, 4);
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      // Fallback para mapa do Brasil
      this.initMap(-14.2350, -51.9253, 4);
    }
  }

  private formatarEndereco(endereco: string, cep?: string): string {
    // Remove múltiplos espaços e normaliza
    endereco = endereco.replace(/\s+/g, ' ').trim().toLowerCase();
    
    // Adiciona CEP se existir
    if (cep) {
      endereco += `, ${cep}`;
    }
    
    // Garante que termine com Brasil
    if (!endereco.includes('brasil')) {
      endereco += ', brasil';
    }
    
    return endereco;
  }

  private async buscarCoordenadasNominatim(query: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1&countrycodes=br`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PETMATCH/1.0 (contato@petmatch.com.br)'
        }
      });

      if (!response.ok) throw new Error('Erro na requisição');

      const data = await response.json();
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Erro na API Nominatim:', error);
    }
    return null;
  }

  private initMap(lat: number, lon: number, zoom: number = 15): void {
    if (!this.mapInitialized) return;

    this.mapReady = true;

    setTimeout(() => {
      this.cleanupMap();

      try {
        this.map = L.map('map', {
          tap: false,
          zoomControl: true
        }).setView([lat, lon], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 3
        }).addTo(this.map);

        const customIcon = L.icon({
          iconUrl: 'assets/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        });

        const marker = L.marker([lat, lon], { icon: customIcon })
          .addTo(this.map)
          .bindPopup(`
            <strong>${this.evento?.titulo || 'Evento'}</strong><br>
            ${this.evento?.local || ''}
          `)
          .openPopup();

        // Círculo de precisão
        const radius = zoom === 15 ? 100 : 50000; // 100m ou 50km
        L.circle([lat, lon], {
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.2,
          radius: radius
        }).addTo(this.map);

      } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
      }
    }, 100);
  }

  private cleanupMap(): void {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  }

  parseOngs(ongsString: string): string[] {
    if (!ongsString) return [];
    return ongsString.split(',').map(ong => ong.trim()).filter(ong => ong.length > 0);
  }

  voltar(): void {
    this.router.navigate(['/eventos']);
  }
}