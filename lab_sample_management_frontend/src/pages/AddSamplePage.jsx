import { useState } from 'react';
import SampleForm from '../components/SampleForm';
import { useAuth } from '../context/AuthContext';
import { useSamples } from '../context/SampleContext';
import { useToast } from '../context/ToastContext';
import {
  TOAST_MESSAGES,
  TOAST_TYPES,
} from '../utils/constants';

export default function AddSamplePage() {
  const { currentUser } = useAuth();
  const { addSample } = useSamples();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      const result = await addSample({
        id: payload.id,
        description: payload.description,
        status: payload.status,
      });

      if (!result.success) {
        showToast(
          result.error || 'Unable to save sample.',
          TOAST_TYPES.ERROR
        );

        return result;
      }

      showToast(
        TOAST_MESSAGES.sampleAdded(result.sample.id),
        TOAST_TYPES.SUCCESS
      );

      return result;
    } catch {
      const failed = {
        success: false,
        error: 'Unable to save sample.',
      };

      showToast(
        failed.error,
        TOAST_TYPES.ERROR
      );

      return failed;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-heading text-2xl font-semibold text-slate-900">
        Add Sample
      </h1>

      <p className="mt-1 text-sm leading-6 text-slate-600">
        Record a new sample without leaving this page.
      </p>

      <div className="mt-6">
        <SampleForm
          mode="create"
          username={currentUser?.username}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}