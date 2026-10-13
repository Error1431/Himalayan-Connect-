import { Link } from 'react-router-dom';

export default function ProfileLink({ id, name, className = '' }) {
    return (
        <Link
            to={`/profile/${id}`}
            className={`font-semibold text-ink-soft hover:text-green-600 hover:underline transition-colors ${className}`}
        >
            {name}
        </Link>
    );
}