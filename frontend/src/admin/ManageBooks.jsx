import { useEffect, useMemo, useState } from "react";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import { addBook, deleteBook, listBooks, updateBook } from "../services/bookService.js";

const emptyForm = {
  id: "",
  name: "",
  brand: "",
  price: "",
  stock: "",
  description: "",
  category: "",
  imageUrl: "",
  sku: "",
};

function parseNumber(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function makeInternalSku(name = "") {
  const cleaned = String(name)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 16);
  const seed = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000)
    .toString(36)
    .toUpperCase()}`;
  return cleaned ? `SKU-${cleaned}-${seed}` : `SKU-${seed}`;
}

export default function ManageProducts() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [books, setBooks] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 0 });
  const [form, setForm] = useState(emptyForm);
  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  async function loadPage(p = 0) {
    setLoading(true);
    setError("");
    try {
      const data = await listBooks({ page: p, size: pageInfo.size });
      setBooks(data?.content ?? []);
      setPageInfo((s) => ({
        ...s,
        page: data?.number ?? p,
        totalPages: data?.totalPages ?? 0,
      }));
    } catch (err) {
      setError(err?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(b) {
    setSuccess("");
    setError("");
    setForm({
      id: b?.id ?? "",
      name: b?.title ?? "",
      brand: b?.authors ?? "",
      price: b?.price ?? "",
      stock: b?.stock ?? "",
      description: b?.description ?? "",
      category: b?.genre ?? "",
      imageUrl: b?.imageUrl ?? "",
      sku: b?.isbn ?? "",
    });
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const normalizedSku = form.sku?.trim() || (isEditing ? "" : makeInternalSku(form.name));
      const payload = {
        title: form.name,
        authors: form.brand,
        price: parseNumber(form.price),
        stock: parseNumber(form.stock),
        description: form.description,
        genre: form.category,
        imageUrl: form.imageUrl,
        isbn: normalizedSku || null,
      };

      if (isEditing) {
        await updateBook(form.id, payload);
        setSuccess("Product updated successfully.");
      } else {
        await addBook(payload);
        setSuccess("Product added successfully.");
      }

      resetForm();
      await loadPage(pageInfo.page);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save product.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!id) return;
    const ok = confirm("Delete this product?");
    if (!ok) return;
    setError("");
    setSuccess("");
    try {
      await deleteBook(id);
      setSuccess("Product deleted.");
      await loadPage(pageInfo.page);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete product.";
      setError(msg);

    }
  }

  return (
    <div>
      <div className="section-surface mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">📚 Manage Products</h1>
            <p className="mt-1 text-sm font-medium text-slate-700">Add, update, and delete products across any catalog category (ADMIN only).</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <form onSubmit={onSubmit} className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{isEditing ? "Edit Product" : "Add Product"}</div>
            {isEditing ? (
              <button
                type="button"
                className="text-sm font-medium text-slate-700 hover:underline"
                onClick={resetForm}
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="mt-3 space-y-2">
            {[
              ["name", "Product Name"],
              ["brand", "Brand / Maker"],
              ["category", "Category"],
              ["sku", "Product Code (SKU, optional)"],
              ["imageUrl", "Image URL"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={key === "name"}
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Price</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  type="number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <button
              disabled={saving}
              className="mt-2 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? <Spinner label="Saving..." /> : isEditing ? "Update Product" : "Add Product"}
            </button>

            <div className="text-xs text-slate-500">
              Works for general products in the admin UI while using current backend inventory routes.
            </div>
          </div>
        </form>

        <div className="rounded-xl border bg-white p-4 shadow-sm lg:col-span-2">
          {error ? (
            <div className="mb-3">
              <Alert type="error" title="Error">
                {error}
              </Alert>
            </div>
          ) : null}
          {success ? (
            <div className="mb-3">
              <Alert type="success" title="Success">
                {success}
              </Alert>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Loading products..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Product</th>
                    <th className="py-2 pr-3">Brand / Maker</th>
                    <th className="py-2 pr-3">Stock</th>
                    <th className="py-2 pr-3">Price</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {books.map((b, idx) => (
                    <tr key={b?.id ?? b?.isbn ?? idx}>
                      <td className="py-2 pr-3 font-medium">{b?.title}</td>
                      <td className="py-2 pr-3">{b?.authors}</td>
                      <td className="py-2 pr-3">{b?.stock ?? "-"}</td>
                      <td className="py-2 pr-3">{b?.price ?? "-"}</td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          <button
                            className="rounded-lg bg-white px-3 py-1 text-xs font-semibold ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
                            onClick={() => startEdit(b)}
                            disabled={!b?.id}
                            type="button"
                            title={!b?.id ? "Product id missing in response" : "Edit"}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                            onClick={() => onDelete(b?.id)}
                            disabled={!b?.id}
                            type="button"
                            title={!b?.id ? "Product id missing in response" : "Delete"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pageInfo.totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    disabled={pageInfo.page <= 0}
                    onClick={() => loadPage(pageInfo.page - 1)}
                    type="button"
                  >
                    Prev
                  </button>
                  <div className="text-sm font-medium text-slate-700">
                    Page <span className="text-slate-900">{pageInfo.page + 1}</span> / {pageInfo.totalPages}
                  </div>
                  <button
                    className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                    onClick={() => loadPage(pageInfo.page + 1)}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

