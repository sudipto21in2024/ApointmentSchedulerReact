using System;
using System.Threading.Tasks;
using Shared.Data;
using Shared.Validators;

namespace SlotManagementService.Validators
{
    public class SlotValidator : Shared.Validators.SlotValidator, ISlotValidator
    {
        public SlotValidator(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}