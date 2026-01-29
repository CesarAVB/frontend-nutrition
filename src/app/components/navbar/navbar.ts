import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  menuAberto = false;
  userMenuOpen = false;
  @ViewChild('mobileMenuContent', { read: ElementRef }) mobileMenuContent?: ElementRef;
  private _originalParent: Node | null = null;
  private _moved = false;
  private _overlay: HTMLElement | null = null;
  private _closeBtn: HTMLElement | null = null;
  
  // ===========================================
  // # constructor - Inicializa o componente
  // ===========================================
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // ===========================================
  // # currentUser - Getter para usuário atual
  // ===========================================
  get currentUser() {
    return this.authService.currentUser();
  }

  // ===========================================
  // # getUserInitials - Obtém iniciais do usuário
  // ===========================================
  getUserInitials(): string {
    const user = this.currentUser;
    if (!user?.name) return 'U';
    
    const names = user.name.split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  // ===========================================
  // # toggleMenu - Alterna estado do menu mobile
  // ===========================================
  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    if (this.userMenuOpen) this.userMenuOpen = false;

    console.log('Navbar.toggleMenu ->', this.menuAberto);
    try {
      if (this.menuAberto) document.body.classList.add('mobile-menu-open');
      else document.body.classList.remove('mobile-menu-open');
    } catch (e) {}

    // Portal move: move menu node to body to avoid clipping by ancestors
    try {
      let el = this.mobileMenuContent?.nativeElement as HTMLElement | undefined;
      if (!el) {
        el = document.querySelector('.mobile-menu-content') as HTMLElement | null || undefined;
      }
      if (!el) {
        console.warn('mobileMenuContent element not found');
      } else {
        if (this.menuAberto && !this._moved) {
          this._originalParent = el.parentNode;
          // Apply inline styles to guarantee visibility even if other CSS overrides exist
          // Apply strong inline styles with !important to override any competing rules
          el.style.setProperty('position', 'fixed', 'important');
          el.style.setProperty('top', '0px', 'important');
          el.style.setProperty('left', '0px', 'important');
          el.style.setProperty('right', '0px', 'important');
          el.style.setProperty('width', '100vw', 'important');
          el.style.setProperty('height', '100vh', 'important');
          // Some environments compute 100vw inconsistently; force pixel fallback
          try {
            const vw = (window.innerWidth || document.documentElement.clientWidth) + 'px';
            const vh = (window.innerHeight || document.documentElement.clientHeight) + 'px';
            el.style.setProperty('width', vw, 'important');
            el.style.setProperty('min-width', vw, 'important');
            el.style.setProperty('height', vh, 'important');
            el.style.setProperty('min-height', vh, 'important');
          } catch (e) {}
          el.style.setProperty('box-sizing', 'border-box', 'important');
          el.style.setProperty('max-width', '100%', 'important');
          el.style.setProperty('background', 'linear-gradient(180deg, rgba(255,255,255,0.985) 0%, rgba(250,251,253,0.985) 100%)', 'important');
          el.style.setProperty('background-color', 'rgba(250,251,253,0.985)', 'important');
          try { (el.style as any).setProperty('backdrop-filter', 'blur(6px)', 'important'); } catch (e) {}
          el.style.setProperty('padding-top', '72px', 'important');
          el.style.setProperty('padding-left', '1rem', 'important');
          el.style.setProperty('padding-right', '1rem', 'important');
          el.style.setProperty('display', 'flex', 'important');
          el.style.setProperty('flex-direction', 'column', 'important');
          el.style.setProperty('gap', '0.5rem', 'important');
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('transform', 'none', 'important');
          el.style.setProperty('transition', 'none', 'important');
          // keep overlay under the menu but above other UI
          el.style.setProperty('z-index', '99999', 'important');
          el.style.setProperty('pointer-events', 'auto', 'important');
          el.style.setProperty('overflow-y', 'auto', 'important');
          // mark as portal-mounted so global styles can target it
          el.classList.add('mobile-menu-portal');

          document.body.appendChild(el);
          // create an in-drawer close button for better UX when portal-mounted
          try {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mobile-menu-close';
            btn.innerHTML = '<i class="fas fa-times"></i>';
            btn.addEventListener('click', () => this.fecharMenu());
            // insert as first child
            el.insertBefore(btn, el.firstChild);
            this._closeBtn = btn;
          } catch (e) {}
          this._moved = true;
        } else if (!this.menuAberto && this._moved) {
          // clear inline styles we set so element can return to original styling when restored
          try {
            el.style.removeProperty('position');
            el.style.removeProperty('top');
            el.style.removeProperty('left');
            el.style.removeProperty('width');
            el.style.removeProperty('height');
            el.style.removeProperty('max-width');
            el.style.removeProperty('background');
            (el.style as any).removeProperty('backdrop-filter');
            el.style.removeProperty('padding-top');
            el.style.removeProperty('padding-left');
            el.style.removeProperty('padding-right');
            el.style.removeProperty('display');
            el.style.removeProperty('flex-direction');
            el.style.removeProperty('gap');
            el.style.removeProperty('opacity');
            el.style.removeProperty('visibility');
            el.style.removeProperty('transform');
            el.style.removeProperty('transition');
            el.style.removeProperty('z-index');
            el.style.removeProperty('pointer-events');
          } catch (e) {}
          if (this._originalParent) this._originalParent.appendChild(el);
          // remove injected close button if present
          try { if (this._closeBtn) { this._closeBtn.remove(); this._closeBtn = null; } } catch (e) {}
          this._moved = false;
        }
      }

      // overlay to allow closing by clicking outside
      if (this.menuAberto) {
        if (!this._overlay) {
          const ov = document.createElement('div');
          ov.id = 'mobile-menu-overlay';
          ov.style.position = 'fixed';
          ov.style.inset = '0';
          ov.style.setProperty('z-index', '99990', 'important');
          ov.style.setProperty('background', 'rgba(0,0,0,0.45)', 'important');
          ov.addEventListener('click', () => this.fecharMenu());
          document.body.appendChild(ov);
          this._overlay = ov;
        }
      } else {
        if (this._overlay) {
          try { this._overlay.remove(); } catch (e) {}
          this._overlay = null;
        }
      }
    } catch (e) { console.error(e); }
  }

  // ===========================================
  // # toggleUserMenu - Alterna estado do menu do usuário
  // ===========================================
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  // ===========================================
  // # fecharMenu - Fecha o menu mobile
  // ===========================================
  fecharMenu(): void {
    this.menuAberto = false;
    try { document.body.classList.remove('mobile-menu-open'); } catch (e) {}
    // restore portal if needed
    try {
      const el = this.mobileMenuContent?.nativeElement as HTMLElement | undefined || document.querySelector('.mobile-menu-content') as HTMLElement | null;
      if (el && this._moved && this._originalParent) {
        try {
          el.style.removeProperty('position');
          el.style.removeProperty('top');
          el.style.removeProperty('left');
          el.style.removeProperty('width');
          el.style.removeProperty('height');
          el.style.removeProperty('max-width');
          el.style.removeProperty('background');
          (el.style as any).removeProperty('backdrop-filter');
          el.style.removeProperty('padding-top');
          el.style.removeProperty('padding-left');
          el.style.removeProperty('padding-right');
          el.style.removeProperty('display');
          el.style.removeProperty('flex-direction');
          el.style.removeProperty('gap');
          el.style.removeProperty('opacity');
          el.style.removeProperty('visibility');
          el.style.removeProperty('transform');
          el.style.removeProperty('transition');
          el.style.removeProperty('z-index');
          el.style.removeProperty('pointer-events');
        } catch (e) {}
        this._originalParent.appendChild(el);
        try { if (this._closeBtn) { this._closeBtn.remove(); this._closeBtn = null; } } catch (e) {}
        this._moved = false;
      }
      if (this._overlay) { try { this._overlay.remove(); } catch (e) {} this._overlay = null; }
    } catch (e) {}
  }

  // ===========================================
  // # navigateToProfile - Navega para o perfil
  // ===========================================
  navigateToProfile(): void {
    this.userMenuOpen = false;
    // TODO: Implementar navegação para perfil
    console.log('Navegando para perfil...');
  }

  // ===========================================
  // # navigateToSettings - Navega para configurações
  // ===========================================
  navigateToSettings(): void {
    this.userMenuOpen = false;
    // TODO: Implementar navegação para configurações
    console.log('Navegando para configurações...');
  }

  // ===========================================
  // # logout - Faz logout do usuário
  // ===========================================
  logout(): void {
    this.userMenuOpen = false;
    // ensure mobile menu and its overlay are fully closed and cleaned up
    try { this.fecharMenu(); } catch (e) { console.warn('fecharMenu error on logout', e); }
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    try {
      const el = this.mobileMenuContent?.nativeElement as HTMLElement | undefined || document.querySelector('.mobile-menu-content') as HTMLElement | null;
      if (el && this._moved && this._originalParent) {
        try {
          el.style.removeProperty('position');
          el.style.removeProperty('top');
          el.style.removeProperty('left');
          el.style.removeProperty('width');
          el.style.removeProperty('height');
          el.style.removeProperty('max-width');
          el.style.removeProperty('background');
          (el.style as any).removeProperty('backdrop-filter');
          el.style.removeProperty('padding-top');
          el.style.removeProperty('padding-left');
          el.style.removeProperty('padding-right');
          el.style.removeProperty('display');
          el.style.removeProperty('flex-direction');
          el.style.removeProperty('gap');
          el.style.removeProperty('opacity');
          el.style.removeProperty('visibility');
          el.style.removeProperty('transform');
          el.style.removeProperty('transition');
          el.style.removeProperty('z-index');
          el.style.removeProperty('pointer-events');
        } catch (e) {}
        this._originalParent.appendChild(el);
        try { if (this._closeBtn) { this._closeBtn.remove(); this._closeBtn = null; } } catch (e) {}
        this._moved = false;
      }
      if (this._overlay) { try { this._overlay.remove(); } catch (e) {} this._overlay = null; }
    } catch (e) {}
  }
}