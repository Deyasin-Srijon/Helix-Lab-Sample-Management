import Button from './Button';
import StatusBadge from './StatusBadge';
import { PencilIcon, TrashIcon } from './icons';
import { formatDate } from '../utils/format';

function ActionButtons({ sample, onEdit, onDelete }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onEdit(sample.id)}
        aria-label={`Edit sample ${sample.id}`}
      >
        <PencilIcon />
        Edit
      </Button>

      <Button
        size="sm"
        variant="danger"
        onClick={() => onDelete(sample)}
        aria-label={`Delete sample ${sample.id}`}
      >
        <TrashIcon />
        Delete
      </Button>
    </div>
  );
}

export default function SampleTable({
  samples,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {samples.map((sample) => (
          <article
            key={sample.id}
            className="rounded-xl border border-border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-xs font-semibold text-slate-800">
                {sample.id}
              </p>

              <StatusBadge status={sample.status} />
            </div>

            <p className="mt-2 text-sm text-slate-800">
              {sample.description}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Requested by {sample.username}
            </p>

            <p className="mt-1 text-xs tabular-nums text-slate-500">
              {formatDate(
                sample.createdDate,
                sample.createdTime
              )}
            </p>

            <div className="mt-4">
              <ActionButtons
                sample={sample}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th
                scope="col"
                className="px-4 py-3"
              >
                ID
              </th>

              <th
                scope="col"
                className="px-4 py-3"
              >
                Description
              </th>

              <th
                scope="col"
                className="px-4 py-3"
              >
                Requested By
              </th>

              <th
                scope="col"
                className="px-4 py-3"
              >
                Status
              </th>

              <th
                scope="col"
                className="px-4 py-3"
              >
                Created Date
              </th>

              <th
                scope="col"
                className="px-4 py-3 text-right"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {samples.map((sample) => (
              <tr
                key={sample.id}
                className="text-slate-800"
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium">
                  {sample.id}
                </td>

                <td className="max-w-xs px-4 py-3">
                  {sample.description}
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  {sample.username}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={sample.status} />
                </td>

                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                  {formatDate(
                    sample.createdDate,
                    sample.createdTime
                  )}
                </td>

                <td className="px-4 py-3">
                  <ActionButtons
                    sample={sample}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}