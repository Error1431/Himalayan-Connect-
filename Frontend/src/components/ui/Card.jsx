import React from 'react';

const Card = ({
    children,
    className = '',
    hover = true,
    border = true,
}) => {
    return (
        <div className={`
      rounded-3xl p-6
      ${border ? 'border border-gray-100 dark:border-gray-700' : ''}
      bg-surface dark:bg-gray-800
      ${hover ? 'hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600' : ''}
      transition-all duration-300
      ${className}
    `}>
            {children}
        </div>
    );
};

export default Card;