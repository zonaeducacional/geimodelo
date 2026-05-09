import React from 'react';
import { useDiary } from '../context/DiaryContext';
import { BookOpen, LayoutDashboard, BarChart3, LogOut, User, HelpCircle, Camera } from 'lucide-react';
import { Button, Modal, Input } from './UI';

export const Navbar: React.FC<{ 
  activeView: 'dashboard' | 'reports' | 'class-detail' | 'manual'; 
  onViewChange: (view: 'dashboard' | 'reports' | 'manual') => void 
}> = ({ activeView, onViewChange }) => {
  const { user, logout, data, updateUser } = useDiary();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [tempName, setTempName] = React.useState(user?.name || '');
  const [tempAvatar, setTempAvatar] = React.useState(user?.avatarUrl || user?.photoURL || '');

  if (!user) return null;

  const displayName = data.settings.teacherName || user.name;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen size={24} />
            <span className="font-serif text-xl font-bold tracking-tight text-ink">Diário</span>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {data.settings.role === 'super_admin' ? (
              <>
                <NavButton 
                  active={activeView !== 'manual'} 
                  onClick={() => onViewChange('dashboard')}
                  icon={<LayoutDashboard size={18} />}
                  label="Painel da Secretaria"
                />
                <NavButton 
                  active={activeView === 'manual'} 
                  onClick={() => onViewChange('manual')}
                  icon={<HelpCircle size={18} />}
                  label="Manual"
                />
              </>
            ) : (
              <>
                <NavButton 
                  active={activeView === 'dashboard' || activeView === 'class-detail'} 
                  onClick={() => onViewChange('dashboard')}
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                />
                <NavButton 
                  active={activeView === 'reports'} 
                  onClick={() => onViewChange('reports')}
                  icon={<BarChart3 size={18} />}
                  label="Relatórios"
                />
                <NavButton 
                  active={activeView === 'manual'} 
                  onClick={() => onViewChange('manual')}
                  icon={<HelpCircle size={18} />}
                  label="Manual"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-ink">{displayName}</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
              {data.settings.role === 'super_admin' ? 'Secretaria' : 'Professor(a)'}
            </span>
          </div>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 overflow-hidden hover:ring-4 hover:ring-primary/10 transition-all"
          >
            {(user?.avatarUrl || user?.photoURL) ? (
              <img src={user.avatarUrl || user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <User size={20} />
            )}
          </button>
          <button 
            onClick={logout}
            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="Meu Perfil">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-neutral-100 border-4 border-white shadow-lg overflow-hidden">
                {tempAvatar ? (
                  <img src={tempAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <User size={40} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Camera size={16} />
                <input 
                  type="text" 
                  className="hidden" 
                  onChange={(e) => setTempAvatar(e.target.value)} 
                  placeholder="URL da Foto"
                />
              </label>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-ink">{user?.email}</p>
              <p className="text-xs text-neutral-400 uppercase tracking-widest">{data.settings.role === 'super_admin' ? 'Administrador' : 'Professor'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Nome de Exibição</label>
              <Input value={tempName} onChange={e => setTempName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Sua Foto (Upload)</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp"
                  className="text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 500 * 1024) {
                        toast.error('Arquivo muito grande! Máximo 500KB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => setTempAvatar(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                  <p className="text-[10px] text-blue-600 font-medium">Recomendações para o VPS:</p>
                  <ul className="text-[9px] text-blue-500/80 list-disc list-inside mt-1 leading-tight">
                    <li>Tipo: .webp ou .jpg</li>
                    <li>Tamanho: 400x400px (quadrado)</li>
                    <li>Peso: Máximo 500KB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsProfileOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={() => {
              updateUser({ name: tempName, avatarUrl: tempAvatar });
              setIsProfileOpen(false);
            }}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </nav>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${
      active ? 'bg-primary/20 text-secondary' : 'text-neutral-500 hover:bg-neutral-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
