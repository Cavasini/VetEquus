import { useVet } from './context/VetContext'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import MeuDiaTab from './components/dashboard/MeuDiaTab'
import AgendaTab from './components/agenda/AgendaTab'
import AnimaisTab from './components/animais/AnimaisTab'
import ReproducaoTab from './components/reproducao/ReproducaoTab'
import ClinicaTab from './components/clinica/ClinicaTab'
import FinanceiroTab from './components/financeiro/FinanceiroTab'
import Toast from './components/common/Toast'
import TriggerConfirmModal from './components/common/TriggerConfirmModal'

export default function App() {
  const { tab } = useVet()
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {tab === 'inicio' && <MeuDiaTab />}
          {tab === 'agenda' && <AgendaTab />}
          {tab === 'animais' && <AnimaisTab />}
          {tab === 'reproducao' && <ReproducaoTab />}
          {tab === 'clinica' && <ClinicaTab />}
          {tab === 'financeiro' && <FinanceiroTab />}
        </main>
      </div>
      <TriggerConfirmModal />
      <Toast />
    </div>
  )
}
