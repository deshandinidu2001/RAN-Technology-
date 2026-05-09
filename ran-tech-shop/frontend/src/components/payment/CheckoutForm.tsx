import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface CheckoutFormProps {
  onSubmit: (shippingInfo: ShippingInfo) => void;
  isLoading?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading }) => {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});

  const validate = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.name) newErrors.name = 'Name is required';
    if (!shippingInfo.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!shippingInfo.address) newErrors.address = 'Address is required';
    if (!shippingInfo.city) newErrors.city = 'City is required';
    if (!shippingInfo.state) newErrors.state = 'State is required';
    if (!shippingInfo.zip) newErrors.zip = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(shippingInfo);
    }
  };

  const handleChange = (field: keyof ShippingInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setShippingInfo((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 bg-primary text-dark rounded-full flex items-center justify-center text-sm font-bold">
            1
          </span>
          Shipping Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Full Name"
              value={shippingInfo.name}
              onChange={handleChange('name')}
              placeholder="John Doe"
              error={errors.name}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Email Address"
              type="email"
              value={shippingInfo.email}
              onChange={handleChange('email')}
              placeholder="john@example.com"
              error={errors.email}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Street Address"
              value={shippingInfo.address}
              onChange={handleChange('address')}
              placeholder="123 Main Street, Apt 4B"
              error={errors.address}
            />
          </div>

          <Input
            label="City"
            value={shippingInfo.city}
            onChange={handleChange('city')}
            placeholder="New York"
            error={errors.city}
          />

          <Input
            label="State / Province"
            value={shippingInfo.state}
            onChange={handleChange('state')}
            placeholder="NY"
            error={errors.state}
          />

          <Input
            label="ZIP / Postal Code"
            value={shippingInfo.zip}
            onChange={handleChange('zip')}
            placeholder="10001"
            error={errors.zip}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-white/10">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Continue to Payment
        </Button>
      </div>
    </motion.form>
  );
};

export default CheckoutForm;
