import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { AdminLayoutProvider } from './context/AdminLayoutContext'
import { RbacProvider } from './context/RbacContext'
import AdminRoutes from './routes/AdminRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <RbacProvider>
          <AdminLayoutProvider>
            <Routes>
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="*" element={<AdminRoutes />} />
            </Routes>
          </AdminLayoutProvider>
        </RbacProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
