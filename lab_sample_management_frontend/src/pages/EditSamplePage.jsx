import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import SampleForm from '../components/SampleForm';
import { useSamples } from '../context/SampleContext';
import { useToast } from '../context/ToastContext';
import {
  TOAST_MESSAGES,
  TOAST_TYPES,
} from '../utils/constants';

export default function EditSamplePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getSampleById,
    isReady,
    updateSample,
  } = useSamples();

  const { showToast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  const sample = getSampleById(id);

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      const result = await updateSample(id, {
        description: payload.description,
        status: payload.status,
      });

      if (!result.success) {
        showToast(
          result.error || 'Unable to update sample.',
          TOAST_TYPES.ERROR
        );

        return result;
      }

      showToast(
        TOAST_MESSAGES.sampleUpdated(result.sample.id),
        TOAST_TYPES.SUCCESS
      );

      navigate('/view-samples');

      return result;
    } catch {
      const failed = {
        success: false,
        error: 'Unable to update sample.',
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
        Edit Sample
      </h1>

      {!isReady ? (
        <LoadingSpinner label="Loading sample" />
      ) : sample ? (
        <>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Username stays locked to the original requester.
          </p>

          <div className="mt-6">
            <SampleForm
              mode="edit"
              username={sample.username}
              initialSample={sample}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() =>
                navigate('/view-samples')
              }
            />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-slate-50 p-6">
          <p className="text-sm text-slate-700">
            Sample not found.
          </p>

          <Button
            variant="secondary"
            className="mt-4"
            onClick={() =>
              navigate('/view-samples')
            }
          >
            Back to samples
          </Button>
        </div>
      )}
    </section>
  );
}