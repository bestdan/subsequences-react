import React from 'react';

interface MyComponentProps {
  name: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ name }) => {
  return (
    <div>
      Hello, {name}!
    </div>
  );
};

