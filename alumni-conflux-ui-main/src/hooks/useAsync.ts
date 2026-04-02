import { useState, useCallback, useEffect } from "react";

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for async operations (API calls)
 * @param asyncFunction - Async function to execute
 * @param immediate - Execute immediately on mount
 */
export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error?.message || "Something went wrong",
      });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { ...state, execute };
};

/**
 * Custom hook for list data with search and filtering
 */
export const useList = <T extends { id: string }>(
  fetchFunction: () => Promise<T[]>,
  searchKey: keyof T = "name" as keyof T
) => {
  const [items, setItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFunction();
      setItems(data);
      setFilteredItems(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredItems(items);
        return;
      }

      const filtered = items.filter((item) =>
        String(item[searchKey])
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    },
    [items, searchKey]
  );

  const refetch = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items: filteredItems,
    allItems: items,
    searchQuery,
    setSearchQuery: handleSearch,
    loading,
    error,
    refetch,
  };
};

/**
 * Custom hook for pagination
 */
export const usePagination = <T,>(items: T[], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * Custom hook for form state management
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error: any) {
      setErrors({
        ...errors,
        submit: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  };
};

/**
 * Custom hook for managing loading states across multiple async operations
 */
export const useMultipleAsync = (
  operations: Record<string, () => Promise<any>>
) => {
  const [states, setStates] = useState<
    Record<string, { loading: boolean; error: string | null }>
  >({});

  const execute = useCallback(
    async (operationKey: string) => {
      setStates((prev) => ({
        ...prev,
        [operationKey]: { loading: true, error: null },
      }));

      try {
        const result = await operations[operationKey]();
        setStates((prev) => ({
          ...prev,
          [operationKey]: { loading: false, error: null },
        }));
        return result;
      } catch (error: any) {
        setStates((prev) => ({
          ...prev,
          [operationKey]: {
            loading: false,
            error: error?.message || "Operation failed",
          },
        }));
        throw error;
      }
    },
    [operations]
  );

  return { states, execute };
};
