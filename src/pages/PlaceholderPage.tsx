import { Link } from 'react-router-dom'

interface Props {
  title: string
  description?: string
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="py-20 text-center px-4">
      <h1 className="text-3xl font-black text-[#141414] mb-4">{title}</h1>
      {description && <p className="text-[#4a4a49] mb-8 max-w-md mx-auto">{description}</p>}
      <Link to="/" className="btn-donate inline-flex px-6 py-3 text-sm">
        Back to Home
      </Link>
    </div>
  )
}
