<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentRequest;
use App\Services\KycConfigService;
use App\Services\KycVerificationService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    use ResponseTrait;
    public $kycVerificationService;
    public $kycConfigService;

    public function __construct()
    {
        $this->kycVerificationService = new KycVerificationService;
        $this->kycConfigService =  new KycConfigService;
    }
    public function index()
    {
        $data['pageTitle'] = __('Documents');
        $data['kycVerifications'] = $this->kycVerificationService->getAllByTenantId(auth()->user()->tenant->id);
        $data['kycConfigs'] = $this->kycConfigService->getActiveByTenantId(auth()->user()->tenant->id);
        return view('tenant.document.index', $data);
    }

    public function store(DocumentRequest $request)
    {
        return $this->kycVerificationService->store($request);
    }

    public function getInfo(Request $request)
    {
        $data = $this->kycVerificationService->getInfo($request->id);
        $data->front = $data->front;
        $data->back = $data->back;
        return $this->success($data);
    }

    public function getConfigInfo(Request $request)
    {
        $data = $this->kycVerificationService->getConfigInfo($request->id);
        $data->image = $data->image;
        return $this->success($data);
    }

    public function delete($id)
    {
        return $this->kycVerificationService->delete($id);
    }
}
