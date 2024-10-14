import { Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useState } from "react";

interface FilterButtonProps {
  onFilterChange: (selectedCategories: string[]) => void;
}

export function FilterButton({ onFilterChange }: FilterButtonProps) {
  const categories = ["sports", "entertainment", "technology", "business"];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    string[]
  >([]);

  const handleCheckboxChange = (category: string) => {
    setTempSelectedCategories((prev) => {
      return prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
    });
  };

  const handleSaveChanges = () => {
    setSelectedCategories(tempSelectedCategories);
    onFilterChange(tempSelectedCategories);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Filter />
          <span>Filter</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-black-2 border-0 p-6">
        <SheetHeader>
          <SheetTitle>Edit Filter</SheetTitle>
          <SheetDescription>Add desired filters</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-row items-center gap-4">
            <Label htmlFor="name" className="text-left">
              Categories
            </Label>
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={tempSelectedCategories.includes(category)}
                  onCheckedChange={() => handleCheckboxChange(category)}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" onClick={handleSaveChanges}>
              Save changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
