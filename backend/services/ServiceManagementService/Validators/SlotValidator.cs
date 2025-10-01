using System;
using System.Threading.Tasks;
using Shared.Data;
using Shared.Validators;

namespace ServiceManagementService.Validators
{
    public class SlotValidator : Shared.Validators.SlotValidator, ISlotValidator
    {
        public SlotValidator(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}