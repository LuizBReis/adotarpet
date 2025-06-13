import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Importe a interface Evento se ela estiver no serviço (se não, defina-a aqui como abaixo)
import { EventoService } from '../../services/evento.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';

declare let L: any; // Declaração para Leaflet

// --- Interface Evento atualizada para o campo 'imagens' como ARRAY ---
export interface Evento {
  id?: number; // Pode ser undefined para eventos novos
  titulo: string;
  descricao: string;
  contato?: string;
  data: string; // Ou Date
  hora_inicio?: string;
  hora_fim?: string;
  local?: string;
  ongs?: string;
  imagens?: string[]; // <--- AGORA É UM ARRAY DE STRINGS
  cep?: string;
  imagemAtual?: number; // <--- NOVO: Para controle do carrossel de mídias
}
// -------------------------------------------------------------------

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
  private coordinatesCache: { [key: string]: { lat: number; lon: number } } = {};

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
        this.evento = {
          ...data,
          imagens: data.imagens || [], // Garante que 'imagens' é um array
          imagemAtual: 0 // Inicializa o índice da mídia atual
        };
        
        if (this.evento.local) {
          this.fetchCoordinates(this.evento.local, this.evento.cep);
        } else {
          this.initMap(-14.2350, -51.9253, 4); // Fallback para Brasil
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar evento:', err);
        this.router.navigate(['/eventos']);
      },
    });
  }

  // --- NOVOS MÉTODOS PARA VERIFICAR TIPO DE MÍDIA (Copiados) ---
  isImage(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.ico'];
    const ext = this.getFileExtension(url);
    return imageExtensions.includes(ext);
  }

  isVideo(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.avi', '.wmv', '.flv'];
    const ext = this.getFileExtension(url);
    return videoExtensions.includes(ext);
  }

  private getFileExtension(url: string): string {
    const lastDotIndex = url.lastIndexOf('.');
    return lastDotIndex !== -1 ? url.substring(lastDotIndex).toLowerCase() : '';
  }
  // ----------------------------------------------------------------------------------

  // --- NOVOS MÉTODOS PARA NAVEGAÇÃO DE MÍDIA (Carrossel) ---
  anteriorMidia(): void {
    if (this.evento && this.evento.imagens && this.evento.imagemAtual !== undefined && this.evento.imagemAtual > 0) {
      this.evento.imagemAtual--;
    }
  }

  proximaMidia(): void {
    if (this.evento && this.evento.imagens && this.evento.imagemAtual !== undefined && this.evento.imagemAtual < this.evento.imagens.length - 1) {
      this.evento.imagemAtual++;
    }
  }
  // ---------------------------------------------------------

  private async fetchCoordinates(endereco: string, cep?: string): Promise<void> {
    try {
      const cacheKey = `${endereco}_${cep || ''}`.toLowerCase();
      if (this.coordinatesCache[cacheKey]) {
        console.log('Usando cache para:', cacheKey);
        this.initMap(this.coordinatesCache[cacheKey].lat, this.coordinatesCache[cacheKey].lon);
        return;
      }

      let enderecoFormatado = this.formatarEndereco(endereco, cep);
      let coordenadas = await this.buscarCoordenadasNominatim(enderecoFormatado);

      if (!coordenadas && cep) {
        enderecoFormatado = `CEP ${cep}, Brasil`;
        coordenadas = await this.buscarCoordenadasNominatim(enderecoFormatado);
      }

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
        this.initMap(-14.2350, -51.9253, 4);
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      this.initMap(-14.2350, -51.9253, 4);
    }
  }

  private formatarEndereco(endereco: string, cep?: string): string {
    endereco = endereco.replace(/\s+/g, ' ').trim().toLowerCase();
    if (cep) {
      endereco += `, ${cep}`;
    }
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

        const radius = zoom === 15 ? 100 : 50000;
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