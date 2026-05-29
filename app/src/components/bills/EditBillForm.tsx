// Edit Bill Form
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn, formatDate } from '@/lib/utils';
import type { Bill, BillCategory, BillStatus, RecurrencePattern } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface EditBillFormProps {
  bill: Bill;
  onSuccess: () => void;
}

export const EditBillForm = ({ bill, onSuccess }: EditBillFormProps) => {
  const { updateBill } = useDataStore();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(bill.title);
  const [amount, setAmount] = useState(bill.amount.toString());
  const [dueDate, setDueDate] = useState<Date>(bill.dueDate.toDate());
  const [category, setCategory] = useState<BillCategory>(bill.category);
  const [status, setStatus] = useState<BillStatus>(bill.status);
  const [isRecurring, setIsRecurring] = useState(bill.isRecurring);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(
    bill.recurrencePattern || 'monthly'
  );
  const [notes, setNotes] = useState(bill.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateBill(bill.id, {
        title,
        amount: parseFloat(amount),
        dueDate: Timestamp.fromDate(dueDate),
        category,
        status,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : undefined,
        notes: notes || undefined,
      });
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Bill Title</Label>
        <Input
          id="title"
          placeholder="e.g., Electricity Bill"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Amount & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as BillCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="credit-card">Credit Card</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as BillStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !dueDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? formatDate(dueDate) : 'Select a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => date && setDueDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Recurring */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
        />
        <Label htmlFor="recurring" className="font-normal cursor-pointer">
          This is a recurring bill
        </Label>
      </div>

      {/* Recurrence Pattern */}
      {isRecurring && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <Label htmlFor="pattern">Recurrence Pattern</Label>
          <Select
            value={recurrencePattern}
            onValueChange={(v) => setRecurrencePattern(v as RecurrencePattern)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
};
