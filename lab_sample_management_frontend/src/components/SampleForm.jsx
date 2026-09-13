import { useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import SelectField from './SelectField';
import { STATUS_OPTIONS } from '../utils/constants';
import { hasErrors, validateSampleForm } from '../utils/validation';

const STATUS_SELECT_OPTIONS = [
  {
    value: STATUS_OPTIONS.CREATED,
    label: STATUS_OPTIONS.CREATED,
  },
  {
    value: STATUS_OPTIONS.IN_PROGRESS,
    label: STATUS_OPTIONS.IN_PROGRESS,
  },
  {
    value: STATUS_OPTIONS.COMPLETED,
    label: STATUS_OPTIONS.COMPLETED,
  },
];

function buildFormState(sample) {
  return {
    id: sample?.id != null ? String(sample.id) : '',
    description: sample?.description || '',
    status: sample?.status || STATUS_OPTIONS.CREATED,
  };
}

export default function SampleForm({
  mode = 'create',
  username,
  initialSample,
  submitting = false,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(() =>
    buildFormState(initialSample)
  );

  const [errors, setErrors] = useState({});

  const updateField = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const resetCreateFields = () => {
    setForm({
      id: '',
      description: '',
      status: STATUS_OPTIONS.CREATED,
    });

    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateSampleForm(
      form,
      {
        CREATED: STATUS_OPTIONS.CREATED,
        IN_PROGRESS: STATUS_OPTIONS.IN_PROGRESS,
        COMPLETED: STATUS_OPTIONS.COMPLETED,
      }
    );

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      const first = ['id', 'description', 'status'].find(
        (key) => nextErrors[key]
      );

      document
        .getElementById(`sample-${first}`)
        ?.focus();

      return;
    }

    const result = await onSubmit({
      id: Number(form.id),
      description: form.description.trim(),
      status: form.status,
    });

    if (mode === 'create' && result?.success) {
      resetCreateFields();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <InputField
        id="sample-id"
        label="Sample ID"
        type="number"
        min="1"
        step="1"
        value={form.id}
        onChange={updateField('id')}
        error={errors.id}
        required
        readOnly={mode === 'edit'}
      />

      <InputField
        id="sample-description"
        label="Description"
        value={form.description}
        onChange={updateField('description')}
        error={errors.description}
        required
      />

      <InputField
        id="sample-username"
        label="Username"
        value={username || ''}
        readOnly
      />

      <SelectField
        id="sample-status"
        label="Status"
        value={form.status}
        onChange={updateField('status')}
        options={STATUS_SELECT_OPTIONS}
        error={errors.status}
        required
      />

      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}

        <Button
          type="submit"
          loading={submitting}
        >
          {mode === 'edit'
            ? 'Save changes'
            : 'Add sample'}
        </Button>
      </div>
    </form>
  );
}